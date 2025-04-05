-- 1. user_settings テーブルを作成します
CREATE TABLE public.user_settings (
    user_id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    ssh_public_key text,
    environment_variables jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- コメントを追加 (任意)
COMMENT ON TABLE public.user_settings IS 'ユーザー固有の設定情報を管理するテーブル';
COMMENT ON COLUMN public.user_settings.user_id IS 'ユーザーID (auth.users.id を参照)';
COMMENT ON COLUMN public.user_settings.ssh_public_key IS 'ユーザーのSSH公開鍵';
COMMENT ON COLUMN public.user_settings.environment_variables IS '環境変数やAPIキーなど (JSON形式でキーと値を保存)';
COMMENT ON COLUMN public.user_settings.created_at IS 'レコード作成日時';
COMMENT ON COLUMN public.user_settings.updated_at IS 'レコード最終更新日時';

-- updated_at を自動更新するトリガーを作成 (関数は既存のものを再利用)
CREATE TRIGGER set_user_settings_timestamp
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- 2. テーブルの行レベルセキュリティ (RLS) を有効にします
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- 3. ユーザーが自身の情報のみを読み書きできるポリシーを作成します
CREATE POLICY "Enable CRUD access for own user settings"
ON public.user_settings
FOR ALL
USING (auth.uid() = user_id);

-- 4. 新規ユーザー登録時に自動的に設定レコードを作成するトリガー
--   (既存の handle_new_user 関数を拡張)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- ユーザー認証情報を挿入
  INSERT INTO public.users (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  
  -- クレジット情報を挿入
  INSERT INTO public.user_credits (user_id)
  VALUES (NEW.id);

  -- ユーザー設定情報を挿入
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 既存ユーザーの設定情報を作成
INSERT INTO public.user_settings (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
