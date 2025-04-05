import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// const ADMIN_EMAIL = "yuki@hamada.tokyo"; // Remove this constant

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // セッションチェック
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 管理者チェック (RPC)
    const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin');
    if (adminError) throw adminError;
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ユーザー一覧取得 (auth.users を参照)
    const { data: users, error: usersError } = await supabase
      .from('auth.users')
      .select('id, email, created_at, last_sign_in_at, raw_user_meta_data');

    if (usersError) {
      console.error('Error fetching users in API:', usersError);
      throw usersError;
    }

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error in users API route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 