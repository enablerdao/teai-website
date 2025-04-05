import { createClient } from '@supabase/supabase-js';

// 環境変数を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 環境変数のチェック
if (!supabaseUrl) {
  console.error('Missing environment variable NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  console.error('Missing environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

if (!supabaseServiceRoleKey) {
  console.error('Missing environment variable SUPABASE_SERVICE_ROLE_KEY');
}

// 通常のクライアント（ブラウザからの使用）
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// サーバーサイドからの管理者権限のアクセス用
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey
);