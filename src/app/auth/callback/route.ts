import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { 
  OrganizationsClient, 
  CreateAccountCommand,
} from "@aws-sdk/client-organizations";

const organizations = new OrganizationsClient({
  region: "ap-northeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
      await supabase.auth.exchangeCodeForSession(code);
      
      // セッションの設定を確認
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // セッションが存在する場合、リダイレクト
        const response = NextResponse.redirect(new URL(next, requestUrl.origin));
        
        // セッションクッキーを設定
        response.cookies.set('sb-access-token', session.access_token, {
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 7 // 1週間
        });

        response.cookies.set('sb-refresh-token', session.refresh_token!, {
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 7 // 1週間
        });

        return response;
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  }

  // エラーまたはセッションが設定できない場合
  return NextResponse.redirect(new URL('/login', requestUrl.origin));
} 