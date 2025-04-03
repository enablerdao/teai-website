import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient(
    { req: request, res },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }
  );
  const { data: { session } } = await supabase.auth.getSession();
  const requestUrl = new URL(request.url);
  const path = requestUrl.pathname;

  // 認証が必要なパス
  const protectedPaths = [
    '/dashboard',    // ダッシュボード
    '/settings',     // 設定ページ
    '/profile',      // プロフィール設定
    '/instances',    // インスタンス管理
    '/billing',      // 課金・プラン管理
    '/api-keys',     // APIキー管理
    '/logs',         // ログ・履歴
    '/agents',       // AIエージェント管理
    '/models',       // モデル管理
    '/deployments',  // デプロイメント管理
  ];

  // 認証済みユーザーがアクセスできないパス
  const authPaths = ['/login', '/register'];

  // 認証が必要なパスへのアクセスチェック
  if (protectedPaths.some(p => path.startsWith(p))) {
    if (!session) {
      // 未認証の場合、ログインページにリダイレクト（現在のパスを保持）
      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(path)}`, request.url)
      );
    }
  }

  // 認証済みユーザーのログイン/登録ページへのアクセスチェック
  if (session && authPaths.some(p => path === p)) {
    // 認証済みの場合、ダッシュボードにリダイレクト
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return res;
}

// ミドルウェアを適用するパスを指定
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};