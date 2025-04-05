CREATE TABLE credit_purchase_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount_yen INTEGER NOT NULL,
  credits INTEGER NOT NULL,
  stripe_session_id TEXT NOT NULL,
  status TEXT NOT NULL,
  CONSTRAINT credit_purchase_history_stripe_session_id_key UNIQUE (stripe_session_id)
);

-- RLSポリシーの設定
ALTER TABLE credit_purchase_history ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分の購入履歴のみ閲覧可能
CREATE POLICY "ユーザーは自分の購入履歴を閲覧可能" ON credit_purchase_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- 管理者は全ての購入履歴を閲覧可能
CREATE POLICY "管理者は全ての購入履歴を閲覧可能" ON credit_purchase_history
  FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM administrators)); 