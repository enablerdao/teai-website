-- yuki@hamada.tokyoを管理者として追加
INSERT INTO public.admin_users (user_id)
SELECT id FROM auth.users WHERE email = 'yuki@hamada.tokyo'
ON CONFLICT (user_id) DO NOTHING; 