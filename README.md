# TeAI Website

AI開発者のためのクラウドプラットフォーム

## 機能

- AWSアカウントの自動作成
- クレジット管理
- インスタンス管理
- ダークモード対応
- 多言語対応

## 開発環境のセットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

## 環境変数

以下の環境変数が必要です：

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# AWS
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
```

## デプロイ

このプロジェクトはVercelにデプロイされています。mainブランチへのプッシュ時に自動的にデプロイされます。

## ライセンス

MIT License
