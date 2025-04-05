-- 最初の管理者を追加
INSERT INTO public.admin_users (user_id)
SELECT id FROM auth.users WHERE email = 'yuki@enabler.co.jp'
ON CONFLICT (user_id) DO NOTHING; 