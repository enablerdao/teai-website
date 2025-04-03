// AWS EC2インスタンス管理用のSupabase Edge Function
// インスタンスの作成、起動、停止、終了、設定変更などの機能を提供
// また、SSH鍵の管理も行う
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { IAMClient, CreateUserCommand, CreateAccessKeyCommand, AttachUserPolicyCommand } from "npm:@aws-sdk/client-iam@^3";
import { EC2Client, RunInstancesCommand, DescribeInstancesCommand, TerminateInstancesCommand, StopInstancesCommand, StartInstancesCommand, ModifyInstanceAttributeCommand, CreateTagsCommand } from "npm:@aws-sdk/client-ec2@^3";

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
# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
fi

# Update system and install required packages based on OS
if [[ "$OS" == "Amazon Linux 2023" ]]; then
    # Amazon Linux 2023
    dnf update -y
    dnf install -y nginx certbot python3-certbot-nginx aws-cli
    APP_USER="ec2-user"
    APP_DIR="/home/ec2-user"
else
    # Ubuntu
    apt-get update
    apt-get upgrade -y
    apt-get install -y nginx certbot python3-certbot-nginx aws-cli
    APP_USER="ubuntu"
    APP_DIR="/home/ubuntu"
fi

# Get instance domain from instance tags
INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
DOMAIN=$(aws ec2 describe-tags --filters "Name=resource-id,Values=$INSTANCE_ID" "Name=key,Values=Domain" --query "Tags[0].Value" --output text)

# Configure Nginx
cat > /etc/nginx/conf.d/app.conf << 'EOL'
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

# Remove default nginx config if it exists
rm -f /etc/nginx/sites-enabled/default
rm -f /etc/nginx/sites-available/default

# Restart Nginx
if [[ "$OS" == "Amazon Linux 2023" ]]; then
    systemctl enable nginx
    systemctl restart nginx
else
    systemctl restart nginx
fi

# Get SSL certificate
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@teai.io

# Start the application
cd $APP_DIR
if [ -f "package.json" ]; then
    npm install
    npm start
fi
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

      case 'update':
        if (!instanceId) throw new Error('Instance ID is required')
        const { instanceType, domain, publicKey } = await req.json()

        let requiresRestart = false
        let message = ''

        // Update instance type if specified
        if (instanceType) {
          await ec2.send(new StopInstancesCommand({
            InstanceIds: [instanceId],
          }))
          
          // Wait for instance to stop
          await new Promise(resolve => setTimeout(resolve, 60000))
          
          await ec2.send(new ModifyInstanceAttributeCommand({
            InstanceId: instanceId,
            InstanceType: { Value: instanceType }
          }))

          // Start the instance after type change
          await ec2.send(new StartInstancesCommand({
            InstanceIds: [instanceId],
          }))

          message += 'インスタンスタイプを変更し、再起動しました。'
        }

        // Update domain tag if specified
        if (domain) {
          await ec2.send(new CreateTagsCommand({
            Resources: [instanceId],
            Tags: [
              {
                Key: "Domain",
                Value: domain
              }
            ]
          }))
          requiresRestart = true
          message += 'ドメインを変更しました。再起動が必要です。'
        }

        // Update public key if specified
        if (publicKey) {
          const userData = `#!/bin/bash
# Update authorized_keys
echo "${publicKey}" > /home/ec2-user/.ssh/authorized_keys
chown ec2-user:ec2-user /home/ec2-user/.ssh/authorized_keys
chmod 600 /home/ec2-user/.ssh/authorized_keys
`
          await ec2.send(new ModifyInstanceAttributeCommand({
            InstanceId: instanceId,
            UserData: { Value: Buffer.from(userData).toString('base64') }
          }))
          requiresRestart = true
          message += 'SSH鍵を更新しました。再起動が必要です。'
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            requiresRestart,
            message: message || '設定を更新しました。'
          }),
          { 
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': req.headers.get('Origin') || '*',
            },
            status: 200,
          }
        )

      case 'add_ssh_key':
        if (!instanceId) throw new Error('Instance ID is required')
        const { name, publicKey } = await req.json()

        // SSH鍵をSupabaseに保存
        const { error: keyError } = await supabaseClient
          .from('instance_ssh_keys')
          .insert({
            instance_id: instanceId,
            user_id: user.id,
            name,
            public_key: publicKey
          })

        if (keyError) throw keyError

        // インスタンスのユーザーデータを更新
        const userData = `#!/bin/bash
# Update authorized_keys
echo "${publicKey}" >> /home/ec2-user/.ssh/authorized_keys
chown ec2-user:ec2-user /home/ec2-user/.ssh/authorized_keys
chmod 600 /home/ec2-user/.ssh/authorized_keys
`
        await ec2.send(new ModifyInstanceAttributeCommand({
          InstanceId: instanceId,
          UserData: { Value: Buffer.from(userData).toString('base64') }
        }))

        return new Response(
          JSON.stringify({ 
            success: true,
            requiresRestart: true,
            message: 'SSH鍵を追加しました。再起動が必要です。'
          }),
          { 
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': req.headers.get('Origin') || '*',
            },
            status: 200,
          }
        )

      case 'list_ssh_keys':
        if (!instanceId) throw new Error('Instance ID is required')

        const { data: sshKeys, error: listError } = await supabaseClient
          .from('instance_ssh_keys')
          .select('*')
          .eq('instance_id', instanceId)
          .eq('user_id', user.id)

        if (listError) throw listError

        return new Response(
          JSON.stringify({ 
            success: true,
            sshKeys
          }),
          { 
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': req.headers.get('Origin') || '*',
            },
            status: 200,
          }
        )

      case 'remove_ssh_key':
        if (!instanceId) throw new Error('Instance ID is required')
        const { keyId } = await req.json()

        // SSH鍵をSupabaseから削除
        const { error: deleteError } = await supabaseClient
          .from('instance_ssh_keys')
          .delete()
          .eq('id', keyId)
          .eq('instance_id', instanceId)
          .eq('user_id', user.id)

        if (deleteError) throw deleteError

        // 残りの鍵を取得
        const { data: remainingKeys } = await supabaseClient
          .from('instance_ssh_keys')
          .select('public_key')
          .eq('instance_id', instanceId)
          .eq('user_id', user.id)

        // インスタンスのユーザーデータを更新
        const remainingKeysData = remainingKeys?.map(k => k.public_key).join('\n') || ''
        const updateUserData = `#!/bin/bash
# Update authorized_keys
echo "${remainingKeysData}" > /home/ec2-user/.ssh/authorized_keys
chown ec2-user:ec2-user /home/ec2-user/.ssh/authorized_keys
chmod 600 /home/ec2-user/.ssh/authorized_keys
`
        await ec2.send(new ModifyInstanceAttributeCommand({
          InstanceId: instanceId,
          UserData: { Value: Buffer.from(updateUserData).toString('base64') }
        }))

        return new Response(
          JSON.stringify({ 
            success: true,
            requiresRestart: true,
            message: 'SSH鍵を削除しました。再起動が必要です。'
          }),
          { 
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': req.headers.get('Origin') || '*',
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