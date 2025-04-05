import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'edge';

const CREDIT_PLANS = [
  { id: 'basic', credits: 5000, amount: 1000 },    // 1,000円で5,000クレジット
  { id: 'standard', credits: 15000, amount: 2500 }, // 2,500円で15,000クレジット
  { id: 'pro', credits: 50000, amount: 7000 },     // 7,000円で50,000クレジット
  { id: 'business', credits: 200000, amount: 25000 }// 25,000円で200,000クレジット
];

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // セッションの確認
    const { data: { session: userSession } } = await supabase.auth.getSession();
    if (!userSession) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    // リクエストボディの取得
    const body = await req.json();
    const { planId } = body;

    // プランの検証
    const plan = CREDIT_PLANS.find(p => p.id === planId);
    if (!plan) {
      return new NextResponse(
        JSON.stringify({ error: '無効なプランが指定されました' }),
        { status: 400 }
      );
    }

    // Stripeキーの取得と検証
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      console.error('Stripe secret key is not set');
      return new NextResponse(
        JSON.stringify({ error: 'Stripe設定が見つかりません' }),
        { status: 500 }
      );
    }

    // Stripeクライアントの初期化
    const stripe = new Stripe(stripeKey, {
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
        userId: userSession.user.id,
        credits: plan.credits.toString(),
        planId: plan.id,
      },
    });

    if (!checkoutSession.url) {
      throw new Error('チェックアウトセッションURLの作成に失敗しました');
    }

    return new NextResponse(
      JSON.stringify({ url: checkoutSession.url }),
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Checkout session creation error:', error);
    
    // Stripeのエラーをより具体的に処理
    let errorMessage = 'クレジットの購入処理中にエラーが発生しました';
    
    if (error instanceof Stripe.errors.StripeError) {
      switch (error.type) {
        case 'StripeCardError':
          errorMessage = 'カード情報の処理中にエラーが発生しました';
          break;
        case 'StripeInvalidRequestError':
          errorMessage = '無効なリクエストです';
          break;
        case 'StripeAPIError':
          errorMessage = 'Stripeサービスとの通信に失敗しました';
          break;
        case 'StripeConnectionError':
          errorMessage = 'ネットワーク接続に問題が発生しました';
          break;
        case 'StripeAuthenticationError':
          errorMessage = 'Stripe APIキーが無効です';
          break;
        case 'StripeRateLimitError':
          errorMessage = 'リクエストが多すぎます。しばらく待ってから再度お試しください';
          break;
      }
    } else if (error.message === 'Unauthorized') {
      errorMessage = '認証されていません。再度ログインしてください';
    }

    return new NextResponse(
      JSON.stringify({ 
        error: errorMessage,
        code: error.type || 'unknown_error'
      }),
      { status: error.statusCode || 500 }
    );
  }
}