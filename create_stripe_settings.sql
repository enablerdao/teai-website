CREATE TABLE IF NOT EXISTS stripe_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  publishable_key TEXT NOT NULL,
  secret_key TEXT NOT NULL,
  webhook_secret TEXT,
  CONSTRAINT stripe_settings_unique UNIQUE (id)
);

-- RLSポリシーの設定
ALTER TABLE stripe_settings ENABLE ROW LEVEL SECURITY;

-- 管理者のみが全ての操作を許可
CREATE POLICY "管理者のみがStripe設定を管理可能" ON stripe_settings
  USING (auth.uid() IN (SELECT user_id FROM administrators))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM administrators));

-- トリガーの設定
CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON stripe_settings
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp(); 