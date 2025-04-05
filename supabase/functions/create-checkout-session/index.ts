import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@12.0.0';

const CREDIT_PLANS = [
  { id: 'basic', credits: 5000, amount: 1000 },    // 1,000円で5,000クレジット
  { id: 'standard', credits: 15000, amount: 2500 }, // 2,500円で15,000クレジット
  { id: 'pro', credits: 50000, amount: 7000 },     // 7,000円で50,000クレジット
  { id: 'business', credits: 200000, amount: 25000 }// 25,000円で200,000クレジット
];

serve(async (req) => {
  try {
    // CORSヘッダーの設定
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        }
      });
    }

    // POSTメソッド以外は拒否
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        error: 'Method not allowed'
      }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // リクエストボディの取得
    const { planId } = await req.json();

    // プランの検証
    const plan = CREDIT_PLANS.find(p => p.id === planId);
    if (!plan) {
      return new Response(JSON.stringify({
        error: '無効なプランが指定されました'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Supabaseクライアントの初期化
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: { persistSession: false }
      }
    );

    // JWTの検証
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({
        error: '認証されていません'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({
        error: '認証に失敗しました'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Stripeクライアントの初期化
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    });

    // チェックアウトセッションの作成
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: `${plan.credits.toLocaleString()} クレジット`,
              description: `${plan.amount.toLocaleString()}円で${plan.credits.toLocaleString()}クレジットを購入`,
            },
            unit_amount: plan.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/dashboard/billing?canceled=true`,
      metadata: {
        userId: user.id,
        credits: plan.credits.toString(),
        planId: plan.id,
      },
    });

    return new Response(JSON.stringify({
      url: checkoutSession.url
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    console.error('Checkout session creation error:', error);
    
    let errorMessage = 'クレジットの購入処理中にエラーが発生しました';
    let statusCode = 500;
    
    if (error instanceof Stripe.errors.StripeError) {
      switch (error.type) {
        case 'StripeCardError':
          errorMessage = 'カード情報の処理中にエラーが発生しました';
          break;
        case 'StripeInvalidRequestError':
          errorMessage = '無効なリクエストです';
          statusCode = 400;
          break;
        case 'StripeAPIError':
          errorMessage = 'Stripeサービスとの通信に失敗しました';
          break;
        case 'StripeConnectionError':
          errorMessage = 'ネットワーク接続に問題が発生しました';
          break;
        case 'StripeAuthenticationError':
          errorMessage = 'Stripe APIキーが無効です';
          statusCode = 401;
          break;
        case 'StripeRateLimitError':
          errorMessage = 'リクエストが多すぎます。しばらく待ってから再度お試しください';
          statusCode = 429;
          break;
      }
    }

    return new Response(JSON.stringify({
      error: errorMessage,
      code: error instanceof Stripe.errors.StripeError ? error.type : 'unknown_error'
    }), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}); 