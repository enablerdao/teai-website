import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

export function HeroSection() {
  return (
    <div className="relative isolate overflow-hidden pt-14">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
          <div className="flex">
            {/* TODO: リンク先が決まったらコメントアウトを解除 */}
            {/*
            <div className="relative flex items-center gap-x-4 rounded-full px-4 py-1 text-sm leading-6 text-muted-foreground ring-1 ring-border hover:ring-border/20">
              <span className="font-semibold text-primary">新登場</span>
              <span className="h-4 w-px bg-border" aria-hidden="true" />
              <a href="#" className="flex items-center gap-x-1">
                <span className="absolute inset-0" aria-hidden="true" />
                プレビュー版を試す
                <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
            */}
          </div>
          <h1 className="mt-10 max-w-lg text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            AIエージェント開発を
            <br />
            もっと速く、簡単に。
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            TeAI.ioは、複雑なタスクを自動化するAIエージェントフレームワーク『OpenHands』専用のクラウドホスティングサービスです。
            サーバー設定やセキュリティ、スケーリングといったインフラ管理の手間から解放され、あなたはAIエージェントの開発という最も重要な作業に集中できます。
          </p>
          <div className="mt-10 flex items-center gap-x-6">
            <Link
              href="/register"
              className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              無料で始める
            </Link>
            <Link href="/docs" className="text-sm font-semibold leading-6 text-foreground">
              ドキュメントを見る <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <div className="mt-16 sm:mt-24 lg:mt-0 lg:flex-shrink-0 lg:flex-grow">
          <div className="relative mx-auto w-full max-w-xl lg:max-w-lg">
            <div className="absolute -top-8 -left-8 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply opacity-70 animate-blob" />
            <div className="absolute -bottom-8 -right-8 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply opacity-70 animate-blob animation-delay-2000" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary/10 to-primary/20 shadow-2xl" />
            <div className="relative rounded-2xl bg-card overflow-hidden border border-border">
              <div className="flex bg-muted px-4 py-2 items-center gap-2 border-b border-border">
                <div className="w-3 h-3 rounded-full bg-red-500/90" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/90" />
                <div className="w-3 h-3 rounded-full bg-green-500/90" />
                <div className="ml-2 text-sm text-muted-foreground">Terminal</div>
              </div>
              <div className="p-6">
                <pre className="text-sm text-muted-foreground font-mono">
                  <code>{`$ teai create instance\n<span class="text-blue-400">Creating new instance...</span> ⚡️\n<span class="text-green-400">✨ Instance "my-app" is ready!</span>\n<span class="text-yellow-400">🚀 Access your app at https://my-app.teai.io</span>\n\n$ teai list instances\nNAME     STATUS    URL\nmy-app   <span class="text-green-400">Running</span>   https://my-app.teai.io\n\n$ teai logs my-app\n<span class="text-muted-foreground">[2025-04-01 01:23:45]</span> Server started on port 3000\n<span class="text-muted-foreground">[2025-04-01 01:23:46]</span> Connected to database\n<span class="text-muted-foreground">[2025-04-01 01:23:47]</span> Loading AI models...\n<span class="text-muted-foreground">[2025-04-01 01:23:48]</span> <span class="text-green-400">✓</span> All systems operational\n`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 