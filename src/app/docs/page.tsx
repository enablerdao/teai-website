'use client';

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-2xl lg:mx-0">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">ドキュメント</h2>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          TeAI.ioの包括的なドキュメント。APIリファレンス、開発ガイド、セキュリティガイドなど、
          必要な情報をすべて網羅しています。
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:mt-10 lg:max-w-none lg:grid-cols-3">
        {/* API Reference */}
        <article className="flex flex-col items-start">
          <div className="flex items-center gap-x-4 text-xs">
            <span className="relative z-10 rounded-full bg-primary/10 px-3 py-1.5 font-medium text-primary">API</span>
          </div>
          <div className="group relative">
            <h3 className="mt-3 text-lg font-semibold leading-6 text-foreground group-hover:text-foreground/80">
              <a href="/docs/api">
                <span className="absolute inset-0" />
                APIリファレンス
              </a>
            </h3>
            <p className="mt-5 line-clamp-3 text-sm leading-6 text-muted-foreground">
              TeAI.ioのRESTful APIの詳細な仕様。認証、エンドポイント、リクエスト/レスポンス形式など。
            </p>
            <div className="mt-4 flex items-center gap-x-4 text-xs">
              <a href="/docs/api/authentication" className="relative hover:text-foreground/80">
                認証
              </a>
              <a href="/docs/api/endpoints" className="relative hover:text-foreground/80">
                エンドポイント
              </a>
              <a href="/docs/api/rate-limits" className="relative hover:text-foreground/80">
                レート制限
              </a>
            </div>
          </div>
        </article>

        {/* Development Guides */}
        <article className="flex flex-col items-start">
          <div className="flex items-center gap-x-4 text-xs">
            <span className="relative z-10 rounded-full bg-primary/10 px-3 py-1.5 font-medium text-primary">開発</span>
          </div>
          <div className="group relative">
            <h3 className="mt-3 text-lg font-semibold leading-6 text-foreground group-hover:text-foreground/80">
              <a href="/docs/development">
                <span className="absolute inset-0" />
                開発ガイド
              </a>
            </h3>
            <p className="mt-5 line-clamp-3 text-sm leading-6 text-muted-foreground">
              OpenHandsフレームワークを使用したAIエージェントの開発方法。ベストプラクティスと実装例。
            </p>
            <div className="mt-4 flex items-center gap-x-4 text-xs">
              <a href="/docs/development/getting-started" className="relative hover:text-foreground/80">
                はじめに
              </a>
              <a href="/docs/development/agents" className="relative hover:text-foreground/80">
                エージェント開発
              </a>
              <a href="/docs/development/deployment" className="relative hover:text-foreground/80">
                デプロイ
              </a>
            </div>
          </div>
        </article>

        {/* Security Guides */}
        <article className="flex flex-col items-start">
          <div className="flex items-center gap-x-4 text-xs">
            <span className="relative z-10 rounded-full bg-primary/10 px-3 py-1.5 font-medium text-primary">セキュリティ</span>
          </div>
          <div className="group relative">
            <h3 className="mt-3 text-lg font-semibold leading-6 text-foreground group-hover:text-foreground/80">
              <a href="/docs/security">
                <span className="absolute inset-0" />
                セキュリティガイド
              </a>
            </h3>
            <p className="mt-5 line-clamp-3 text-sm leading-6 text-muted-foreground">
              セキュリティベストプラクティス、認証、アクセス制御、データ保護に関するガイドライン。
            </p>
            <div className="mt-4 flex items-center gap-x-4 text-xs">
              <a href="/docs/security/authentication" className="relative hover:text-foreground/80">
                認証
              </a>
              <a href="/docs/security/authorization" className="relative hover:text-foreground/80">
                認可
              </a>
              <a href="/docs/security/data-protection" className="relative hover:text-foreground/80">
                データ保護
              </a>
            </div>
          </div>
        </article>
      </div>

      {/* Quick Links */}
      <div className="mx-auto mt-16 max-w-2xl lg:mx-0 lg:max-w-none">
        <h3 className="text-xl font-semibold text-foreground">クイックリンク</h3>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a href="/docs/api/quickstart" className="group relative flex items-center gap-x-3 rounded-lg border border-border bg-card p-6 hover:bg-card/80">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">APIクイックスタート</h4>
              <p className="mt-1 text-sm text-muted-foreground">5分で始められるAPIの基本的な使い方</p>
            </div>
          </a>

          <a href="/docs/development/examples" className="group relative flex items-center gap-x-3 rounded-lg border border-border bg-card p-6 hover:bg-card/80">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">コード例</h4>
              <p className="mt-1 text-sm text-muted-foreground">実践的なコード例とユースケース</p>
            </div>
          </a>

          <a href="/docs/security/checklist" className="group relative flex items-center gap-x-3 rounded-lg border border-border bg-card p-6 hover:bg-card/80">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">セキュリティチェックリスト</h4>
              <p className="mt-1 text-sm text-muted-foreground">デプロイ前のセキュリティ確認項目</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}