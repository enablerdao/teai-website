export default function TutorialPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-2xl lg:mx-0">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">チュートリアル</h2>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          ステップバイステップのチュートリアルで、TeAI.ioの基本的な使い方を学びましょう。
          初心者から上級者まで、様々なレベルのチュートリアルを用意しています。
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:mt-10 lg:max-w-none lg:grid-cols-3">
        {/* Beginner Tutorial */}
        <article className="flex flex-col items-start">
          <div className="flex items-center gap-x-4 text-xs">
            <span className="relative z-10 rounded-full bg-primary/10 px-3 py-1.5 font-medium text-primary">入門</span>
          </div>
          <div className="group relative">
            <h3 className="mt-3 text-lg font-semibold leading-6 text-foreground group-hover:text-foreground/80">
              <a href="/tutorial/getting-started">
                <span className="absolute inset-0" />
                はじめに
              </a>
            </h3>
            <p className="mt-5 line-clamp-3 text-sm leading-6 text-muted-foreground">
              TeAI.ioの基本的な概念と使い方を学びます。アカウント作成から最初のアプリケーションのデプロイまで。
            </p>
            <div className="mt-4 flex items-center gap-x-4 text-xs">
              <a href="/tutorial/getting-started/account" className="relative hover:text-foreground/80">
                アカウント作成
              </a>
              <a href="/tutorial/getting-started/first-app" className="relative hover:text-foreground/80">
                最初のアプリ
              </a>
              <a href="/tutorial/getting-started/deploy" className="relative hover:text-foreground/80">
                デプロイ
              </a>
            </div>
          </div>
        </article>

        {/* Intermediate Tutorial */}
        <article className="flex flex-col items-start">
          <div className="flex items-center gap-x-4 text-xs">
            <span className="relative z-10 rounded-full bg-primary/10 px-3 py-1.5 font-medium text-primary">中級</span>
          </div>
          <div className="group relative">
            <h3 className="mt-3 text-lg font-semibold leading-6 text-foreground group-hover:text-foreground/80">
              <a href="/tutorial/ai-agent">
                <span className="absolute inset-0" />
                AIエージェントの作成
              </a>
            </h3>
            <p className="mt-5 line-clamp-3 text-sm leading-6 text-muted-foreground">
              OpenHandsフレームワークを使用して、カスタムAIエージェントを作成し、TeAI.ioにデプロイする方法を学びます。
            </p>
            <div className="mt-4 flex items-center gap-x-4 text-xs">
              <a href="/tutorial/ai-agent/setup" className="relative hover:text-foreground/80">
                環境構築
              </a>
              <a href="/tutorial/ai-agent/development" className="relative hover:text-foreground/80">
                エージェント開発
              </a>
              <a href="/tutorial/ai-agent/testing" className="relative hover:text-foreground/80">
                テスト
              </a>
            </div>
          </div>
        </article>

        {/* Advanced Tutorial */}
        <article className="flex flex-col items-start">
          <div className="flex items-center gap-x-4 text-xs">
            <span className="relative z-10 rounded-full bg-primary/10 px-3 py-1.5 font-medium text-primary">上級</span>
          </div>
          <div className="group relative">
            <h3 className="mt-3 text-lg font-semibold leading-6 text-foreground group-hover:text-foreground/80">
              <a href="/tutorial/advanced">
                <span className="absolute inset-0" />
                高度な機能
              </a>
            </h3>
            <p className="mt-5 line-clamp-3 text-sm leading-6 text-muted-foreground">
              スケーリング、モニタリング、CI/CDなど、高度な機能の使い方とベストプラクティスを学びます。
            </p>
            <div className="mt-4 flex items-center gap-x-4 text-xs">
              <a href="/tutorial/advanced/scaling" className="relative hover:text-foreground/80">
                スケーリング
              </a>
              <a href="/tutorial/advanced/monitoring" className="relative hover:text-foreground/80">
                モニタリング
              </a>
              <a href="/tutorial/advanced/ci-cd" className="relative hover:text-foreground/80">
                CI/CD
              </a>
            </div>
          </div>
        </article>
      </div>

      {/* Learning Path */}
      <div className="mx-auto mt-16 max-w-2xl lg:mx-0 lg:max-w-none">
        <h3 className="text-xl font-semibold text-foreground">学習パス</h3>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a href="/tutorial/path/beginner" className="group relative flex items-center gap-x-3 rounded-lg border border-border bg-card p-6 hover:bg-card/80">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">初心者向けパス</h4>
              <p className="mt-1 text-sm text-muted-foreground">基礎から学ぶ2週間の学習コース</p>
            </div>
          </a>

          <a href="/tutorial/path/intermediate" className="group relative flex items-center gap-x-3 rounded-lg border border-border bg-card p-6 hover:bg-card/80">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">中級者向けパス</h4>
              <p className="mt-1 text-sm text-muted-foreground">実践的なプロジェクト開発コース</p>
            </div>
          </a>

          <a href="/tutorial/path/advanced" className="group relative flex items-center gap-x-3 rounded-lg border border-border bg-card p-6 hover:bg-card/80">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">上級者向けパス</h4>
              <p className="mt-1 text-sm text-muted-foreground">エキスパート向け高度な開発コース</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
} 