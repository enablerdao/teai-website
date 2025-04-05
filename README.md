# 🖐️ TeAI Website

<div align="center">
  <img src="public/images/teai-logo.png" alt="TeAI Logo" width="200" />
  <p><strong>AI開発者のためのクラウドプラットフォーム</strong></p>
  <p>
    <a href="https://github.com/enablerdao/teai-website/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/enablerdao/teai-website" alt="License" />
    </a>
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" />
    <img src="https://img.shields.io/badge/Next.js-14-black" alt="Next.js" />
  </p>
</div>

## 📋 概要

TeAIは、AIによるコード生成・コマンド実行・ウェブ操作を自然言語で指示できる開発支援SaaSです。APIがないサービスもブラウザ操作で自動化可能。面倒なセットアップやキー管理から解放され、すぐに開発に集中できます。

## ✨ 主な機能

- 🚀 **AWSアカウントの自動作成** - ワンクリックでAWSアカウントを作成
- 💰 **クレジット管理** - 使用量に応じた透明性の高い課金システム
- 🖥️ **インスタンス管理** - 複数のインスタンスを簡単に管理
- 🌓 **ダークモード対応** - 目に優しいダークモードをサポート
- 🌐 **多言語対応** - 複数の言語に対応

## 🚀 クイックスタート

### 前提条件

- Node.js 18.x以上
- npm または yarn

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/enablerdao/teai-website.git
cd teai-website

# 依存関係のインストール
npm install
# または
yarn install
```

### 環境変数の設定

`.env.example`ファイルを`.env`にコピーして、必要な環境変数を設定します：

```bash
cp .env.example .env
```

`.env`ファイルを編集して、以下の環境変数を設定します：

```bash
# 基本設定
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Supabase設定（開発モードでは省略可能）
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Stripe設定（決済機能を使用する場合）
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AWS設定（AWSサービスを使用する場合）
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
```

### 開発サーバーの起動

```bash
# 開発サーバーの起動
npm run dev
# または
yarn dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて、アプリケーションを確認できます。

## 🛠️ 開発モード

開発モードでは、認証やデータベース接続をバイパスして、UIの開発に集中できます。

### 開発モードの有効化

開発モードはデフォルトで有効になっています。以下のファイルが開発モード用に設定されています：

- `src/middleware.ts` - 認証をバイパス
- `src/app/dashboard/layout.tsx` - モックユーザーを使用
- `src/app/dashboard/page.tsx` - 簡易ダッシュボードを表示

### 本番モードへの切り替え

本番環境で使用する場合は、以下の設定が必要です：

1. `src/middleware.ts`を元の状態に戻す
2. 実際のSupabase、Stripe、AWS認証情報を設定する
3. データベース接続を設定する

## 📚 プロジェクト構造

```
teai-website/
├── public/           # 静的ファイル
├── prisma/           # Prismaスキーマとマイグレーション
├── src/              # ソースコード
│   ├── app/          # Next.js App Router
│   ├── components/   # UIコンポーネント
│   ├── lib/          # ユーティリティ関数
│   └── middleware.ts # ミドルウェア（認証など）
├── .env.example      # 環境変数のサンプル
└── next.config.js    # Next.js設定
```

## 🔄 デプロイ

このプロジェクトはVercelにデプロイされています。mainブランチへのプッシュ時に自動的にデプロイされます。

### 手動デプロイ

```bash
# ビルド
npm run build
# または
yarn build

# 起動
npm start
# または
yarn start
```

## 🤝 コントリビューション

コントリビューションは大歓迎です！以下の方法で貢献できます：

1. このリポジトリをフォークする
2. 新しいブランチを作成する (`git checkout -b feature/amazing-feature`)
3. 変更をコミットする (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュする (`git push origin feature/amazing-feature`)
5. プルリクエストを作成する

## 📝 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルをご覧ください。

## 📞 サポート

質問や問題がある場合は、[Issueを作成](https://github.com/enablerdao/teai-website/issues/new)してください。
