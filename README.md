# TeAI Website

AI開発者のためのクラウドプラットフォーム (Cloud Platform for AI Developers)

## 機能 (Features)

- AWSアカウントの自動作成 (Automated AWS account creation)
- クレジット管理 (Credit management)
- インスタンス管理 (Instance management)
- ダークモード対応 (Dark mode support)
- 多言語対応 (Multilingual support)

## 開発環境のセットアップ (Development Setup)

```bash
# 依存関係のインストール (Install dependencies)
npm install

# 開発サーバーの起動 (Start development server)
npm run dev
```

## 環境変数 (Environment Variables)

以下の環境変数が必要です。詳細は [.env.example](.env.example) ファイルを参照してください：

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# AWS
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

## デプロイ (Deployment)

このプロジェクトは [Vercel](https://vercel.com) にデプロイされています。[main](https://github.com/enablerdao/teai-website/tree/main) ブランチへのプッシュ時に自動的にデプロイされます。

## ライセンス (License)

[MIT License](LICENSE)
