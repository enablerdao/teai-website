import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { 
  OrganizationsClient,
  CreateOrganizationCommand,
  CreateAccountCommand,
  ListAccountsCommand,
  CreateOrganizationalUnitCommand,
  ListOrganizationalUnitsForParentCommand,
} from "npm:@aws-sdk/client-organizations@^3"
import {
  IAMClient,
  CreateUserCommand,
  CreateAccessKeyCommand,
  AttachUserPolicyCommand,
  ListAttachedUserPoliciesCommand,
} from "npm:@aws-sdk/client-iam@^3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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

    // Create AWS clients with master credentials
    const orgClient = new OrganizationsClient({
      region: "ap-northeast-1",
      credentials: {
        accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID') ?? '',
        secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY') ?? '',
      },
    })

    const iamClient = new IAMClient({
      region: "ap-northeast-1",
      credentials: {
        accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID') ?? '',
        secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY') ?? '',
      },
    })

    const { action } = await req.json()

    switch (action) {
      case 'create_organization':
        // Create organization for the user
        const createOrgCommand = new CreateOrganizationCommand({
          FeatureSet: "ALL",
        })
        const orgResult = await orgClient.send(createOrgCommand)
        const orgId = orgResult.Organization?.Id

        if (!orgId) throw new Error('Failed to create organization')

        // Create organizational unit for the user
        const createOUCommand = new CreateOrganizationalUnitCommand({
          ParentId: orgId,
          Name: `User-${user.id}`,
        })
        const ouResult = await orgClient.send(createOUCommand)
        const ouId = ouResult.OrganizationalUnit?.Id

        if (!ouId) throw new Error('Failed to create organizational unit')

        // Create AWS account for the user
        const createAccountCommand = new CreateAccountCommand({
          Email: user.email,
          AccountName: `User-${user.id}`,
          ParentId: ouId,
          RoleName: "OrganizationAccountAccessRole",
        })
        const accountResult = await orgClient.send(createAccountCommand)
        const accountId = accountResult.CreateAccountStatus?.AccountId

        if (!accountId) throw new Error('Failed to create AWS account')

        // Create IAM user for the account
        const createUserCommand = new CreateUserCommand({
          UserName: `user-${user.id}`,
          Path: '/',
        })
        const userResult = await iamClient.send(createUserCommand)
        const iamUserName = userResult.User?.UserName

        if (!iamUserName) throw new Error('Failed to create IAM user')

        // Create access key for the IAM user
        const createAccessKeyCommand = new CreateAccessKeyCommand({
          UserName: iamUserName,
        })
        const accessKeyResult = await iamClient.send(createAccessKeyCommand)
        const accessKey = accessKeyResult.AccessKey

        if (!accessKey) throw new Error('Failed to create access key')

        // Attach necessary policies to the IAM user
        const attachPolicyCommand = new AttachUserPolicyCommand({
          UserName: iamUserName,
          PolicyArn: 'arn:aws:iam::aws:policy/AmazonEC2FullAccess',
        })
        await iamClient.send(attachPolicyCommand)

        // Save the credentials to the database
        const { error: saveError } = await supabaseClient
          .from('aws_credentials')
          .upsert({
            user_id: user.id,
            access_key_id: accessKey.AccessKeyId,
            secret_access_key: accessKey.SecretAccessKey,
            organization_id: orgId,
            account_id: accountId,
            iam_username: iamUserName,
          })

        if (saveError) throw saveError

        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'Organization and IAM user created successfully'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )

      case 'list_organizations':
        const listAccountsCommand = new ListAccountsCommand({})
        const accountsResult = await orgClient.send(listAccountsCommand)
        return new Response(
          JSON.stringify({ 
            success: true,
            accounts: accountsResult.Accounts
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )

      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 