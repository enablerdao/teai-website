import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { IAMClient, CreateUserCommand, CreateAccessKeyCommand, AttachUserPolicyCommand } from "npm:@aws-sdk/client-iam@^3";
import { EC2Client, RunInstancesCommand, DescribeInstancesCommand, TerminateInstancesCommand, StopInstancesCommand, StartInstancesCommand } from "npm:@aws-sdk/client-ec2@^3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Origin': req.headers.get('Origin') || '*'
      }
    })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')!
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Get the current user
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { action, instanceId } = await req.json()

    // AWS認証情報の取得または作成
    let awsCredentials;
    const { data: existingCredentials, error: credsError } = await supabaseClient
      .from('aws_credentials')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (credsError || !existingCredentials) {
      // 新規ユーザーの場合、IAMユーザーを作成
      const iam = new IAMClient({
        region: 'ap-northeast-1',
        credentials: {
          accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID')!,
          secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY')!,
        }
      })

      // IAMユーザーを作成
      const iamUserName = `teai-user-${user.id}`
      const createUserResult = await iam.send(new CreateUserCommand({
        UserName: iamUserName,
        Tags: [
          {
            Key: "UserId",
            Value: user.id,
          },
        ]
      }))

      // アクセスキーを作成
      const accessKeyResult = await iam.send(new CreateAccessKeyCommand({
        UserName: iamUserName,
      }))
      
      if (!accessKeyResult.AccessKey?.AccessKeyId || !accessKeyResult.AccessKey?.SecretAccessKey) {
        throw new Error('Failed to create access key')
      }

      // EC2の権限を付与
      await iam.send(new AttachUserPolicyCommand({
        UserName: iamUserName,
        PolicyArn: 'arn:aws:iam::aws:policy/AmazonEC2FullAccess',
      }))

      // 認証情報をSupabaseに保存
      const { error: saveError } = await supabaseClient
        .from('aws_credentials')
        .insert({
          user_id: user.id,
          access_key_id: accessKeyResult.AccessKey.AccessKeyId,
          secret_access_key: accessKeyResult.AccessKey.SecretAccessKey,
          iam_username: iamUserName,
        })

      if (saveError) throw saveError
      awsCredentials = {
        access_key_id: accessKeyResult.AccessKey.AccessKeyId,
        secret_access_key: accessKeyResult.AccessKey.SecretAccessKey,
      }
    } else {
      awsCredentials = existingCredentials
    }

    // AWSクライアントの作成
    const ec2 = new EC2Client({
      region: 'ap-northeast-1',
      credentials: {
        accessKeyId: awsCredentials.access_key_id,
        secretAccessKey: awsCredentials.secret_access_key
      }
    })

    switch (action) {
      case 'create':
        // Create new instance
        const createResult = await ec2.send(new RunInstancesCommand({
          ImageId: "ami-0d7927c66a4f58940",
          InstanceType: "t2.medium",
          MinCount: 1,
          MaxCount: 1,
          KeyName: "teai-key",
          UserData: Buffer.from(`#!/bin/bash
# Update system
apt-get update
apt-get upgrade -y

# Install Nginx
apt-get install -y nginx

# Install Certbot
apt-get install -y certbot python3-certbot-nginx

# Get instance domain from instance tags
INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
DOMAIN=$(aws ec2 describe-tags --filters "Name=resource-id,Values=$INSTANCE_ID" "Name=key,Values=Domain" --query "Tags[0].Value" --output text)

# Configure Nginx
cat > /etc/nginx/sites-available/default << 'EOL'
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOL

# Enable the site
ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/

# Restart Nginx
systemctl restart nginx

# Get SSL certificate
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@teai.io

# Start the application
cd /home/ubuntu
npm install
npm start
`).toString('base64'),
          TagSpecifications: [
            {
              ResourceType: "instance",
              Tags: [
                {
                  Key: "Name",
                  Value: `teai-instance-${user.id}`,
                },
                {
                  Key: "User",
                  Value: user.id,
                },
                {
                  Key: "Domain",
                  Value: `oh-${Math.random().toString(36).substring(2, 8)}.teai.io`,
                },
              ],
            },
          ],
        }))

        return new Response(
          JSON.stringify({ 
            success: true, 
            instanceId: createResult.Instances?.[0].InstanceId 
          }),
          { 
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': req.headers.get('Origin') || '*'
            },
            status: 200,
          }
        )

      case 'start':
        if (!instanceId) throw new Error('Instance ID is required')
        await ec2.send(new StartInstancesCommand({
          InstanceIds: [instanceId],
        }))
        return new Response(
          JSON.stringify({ success: true }),
          { 
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': req.headers.get('Origin') || '*',
            },
            status: 200,
          }
        )

      case 'stop':
        if (!instanceId) throw new Error('Instance ID is required')
        await ec2.send(new StopInstancesCommand({
          InstanceIds: [instanceId],
        }))
        return new Response(
          JSON.stringify({ success: true }),
          { 
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': req.headers.get('Origin') || '*',
            },
            status: 200,
          }
        )

      case 'terminate':
        if (!instanceId) throw new Error('Instance ID is required')
        await ec2.send(new TerminateInstancesCommand({
          InstanceIds: [instanceId],
        }))
        return new Response(
          JSON.stringify({ success: true }),
          { 
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': req.headers.get('Origin') || '*',
            },
            status: 200,
          }
        )

      case 'list':
        const describeResult = await ec2.send(new DescribeInstancesCommand({
          Filters: [
            {
              Name: "tag:User",
              Values: [user.id],
            },
            {
               Name: "instance-state-name",
               Values: ["pending", "running", "stopping", "stopped"],
            }
          ],
        }))

        const instances = describeResult.Reservations?.flatMap(r => r.Instances || [])
          .map(instance => ({
              InstanceId: instance.InstanceId,
              InstanceType: instance.InstanceType,
              State: instance.State?.Name,
              PublicIpAddress: instance.PublicIpAddress,
              LaunchTime: instance.LaunchTime,
              AccessUrl: instance.PublicIpAddress ? `http://${instance.PublicIpAddress}:3000` : null
          })) || [];

        return new Response(
          JSON.stringify({ 
            success: true, 
            instances: instances 
          }),
          { 
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': req.headers.get('Origin') || '*'
            },
            status: 200,
          }
        )

      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
}) 