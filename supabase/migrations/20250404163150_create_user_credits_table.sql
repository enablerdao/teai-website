-- 1. user_credits テーブルを作成します
CREATE TABLE public.user_credits (
    user_id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    balance numeric NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- コメントを追加 (任意)
COMMENT ON TABLE public.user_credits IS 'ユーザーのクレジット残高を管理するテーブル';
COMMENT ON COLUMN public.user_credits.user_id IS 'ユーザーID (auth.users.id を参照)';
COMMENT ON COLUMN public.user_credits.balance IS '現在のクレジット残高 (円建て)';
COMMENT ON COLUMN public.user_credits.created_at IS 'レコード作成日時';
COMMENT ON COLUMN public.user_credits.updated_at IS 'レコード最終更新日時';

-- updated_at を自動更新するためのトリガー関数 (存在しない場合)
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at を自動更新するトリガーを作成
CREATE TRIGGER set_user_credits_timestamp
BEFORE UPDATE ON public.user_credits
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- 2. テーブルの行レベルセキュリティ (RLS) を有効にします
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- 3. ユーザーが自身のクレジット情報のみを読み取れる (SELECT) ポリシーを作成します
CREATE POLICY "Enable read access for own user credits"
ON public.user_credits
FOR SELECT
USING (auth.uid() = user_id);

-- 注意: INSERT や UPDATE が必要な場合、別途ポリシーを作成する必要があります。
-- 例: サーバーサイド(Functionsなど)からのみ更新を許可する場合
-- CREATE POLICY "Allow server-side update access"
-- ON public.user_credits
-- FOR UPDATE
-- USING (true) -- 必要に応じて条件を追加
-- WITH CHECK (true); -- 必要に応じて条件を追加

-- 4. 新規ユーザー登録時に自動的にクレジット情報を作成するトリガー
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_credits (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.usersテーブルに新規ユーザーが追加された時のトリガーを作成
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. 既存ユーザーのクレジット情報を作成
INSERT INTO public.user_credits (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
