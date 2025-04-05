-- 1. 既存のSSHキーを environment_variables に移行 (存在する場合)
UPDATE public.user_settings
SET environment_variables = environment_variables || jsonb_build_object('SSH_PUBLIC_KEY', ssh_public_key)
WHERE ssh_public_key IS NOT NULL AND ssh_public_key != '';

-- 2. user_settings テーブルから ssh_public_key カラムを削除
ALTER TABLE public.user_settings
DROP COLUMN IF EXISTS ssh_public_key;
