import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { CostExplorer } from "@aws-sdk/client-cost-explorer";

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    // Get AWS credentials for the user
    const { data: credentials, error: credsError } = await supabase
      .from('aws_credentials')
      .select('access_key_id, secret_access_key, iam_username')
      .eq('user_id', session.user.id)
      .single();

    if (credsError) {
      console.error('Database error fetching AWS credentials:', credsError);
      return new NextResponse(
        JSON.stringify({ error: 'AWS認証情報の取得に失敗しました (DB Error)' }),
        { status: 500 }
      );
    }

    if (!credentials) {
      console.error('No AWS credentials found for user:', session.user.id);
      return new NextResponse(
        JSON.stringify({ error: 'AWS認証情報が設定されていません' }),
        { status: 404 }
      );
    }

    if (!credentials.access_key_id || !credentials.secret_access_key) {
      console.error('Invalid AWS credentials format for user:', session.user.id);
      return new NextResponse(
        JSON.stringify({ error: 'AWS認証情報が不正です' }),
        { status: 400 }
      );
    }

    console.log('Attempting to create Cost Explorer client for IAM user:', credentials.iam_username);

    // Create AWS Cost Explorer client
    const costExplorer = new CostExplorer({
      region: "us-east-1", // Cost Explorer is only available in us-east-1
      credentials: {
        accessKeyId: credentials.access_key_id,
        secretAccessKey: credentials.secret_access_key,
      },
    });

    // Get current month's cost
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    console.log('Fetching cost data for period:', {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    });

    try {
      const costData = await costExplorer.getCostAndUsage({
        TimePeriod: {
          Start: start.toISOString().split('T')[0],
          End: end.toISOString().split('T')[0],
        },
        Granularity: 'MONTHLY',
        Metrics: ['UnblendedCost'],
        GroupBy: [{
          Type: 'DIMENSION',
          Key: 'SERVICE'
        }]
      });

      // Calculate costs for EC2 and Lambda separately
      let ec2Cost = 0;
      let lambdaCost = 0;
      let otherCost = 0;

      costData.ResultsByTime?.[0]?.Groups?.forEach(group => {
        const amount = parseFloat(group.Metrics?.UnblendedCost?.Amount || '0');
        if (group.Keys?.[0]?.includes('Amazon Elastic Compute')) {
          ec2Cost += amount;
        } else if (group.Keys?.[0]?.includes('AWS Lambda')) {
          lambdaCost += amount;
        } else {
          otherCost += amount;
        }
      });

      console.log('Successfully fetched cost data:', { ec2Cost, lambdaCost, otherCost });

      return new NextResponse(
        JSON.stringify({
          costs: {
            ec2: Math.round(ec2Cost),
            lambda: Math.round(lambdaCost),
            other: Math.round(otherCost),
            total: Math.round(ec2Cost + lambdaCost + otherCost)
          }
        }),
        { status: 200 }
      );

    } catch (costError: any) {
      console.error('AWS Cost Explorer API error:', {
        code: costError.name,
        message: costError.message,
        requestId: costError.$metadata?.requestId,
      });

      // Check for specific AWS errors
      if (costError.name === 'AccessDeniedException') {
        return new NextResponse(
          JSON.stringify({ 
            error: 'AWS Cost Explorerへのアクセス権限がありません。IAMユーザーの権限を確認してください。',
            details: costError.message
          }),
          { status: 403 }
        );
      }

      throw costError; // Re-throw for general error handling
    }

  } catch (error: any) {
    console.error('Error in AWS cost route:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    return new NextResponse(
      JSON.stringify({ 
        error: 'AWS利用料金の取得に失敗しました',
        details: error.message
      }),
      { status: 500 }
    );
  }
} 