-- 新規ユーザー登録時に自動的にクレジット情報を作成するトリガー
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

-- 既存ユーザーのクレジット情報を作成
INSERT INTO public.user_credits (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
