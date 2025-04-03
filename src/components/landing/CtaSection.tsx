import Link from 'next/link'

export function CtaSection() {
  return (
    <div className="relative isolate mt-32 px-6 py-32 sm:mt-56 sm:py-40 lg:px-8">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[calc(50%-19rem)] top-[calc(50%-36rem)] transform-gpu blur-3xl">
          <div
            className="aspect-[1097/1023] w-[68.5625rem] bg-gradient-to-r from-primary/10 to-primary/20"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
      </div>
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          今すぐ始めましょう
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
          いますぐ TeAI.io のパワフルな機能を体験してみませんか？
          Pro プランの14日間無料トライアルは、クレジットカードの登録なしで始められます。
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/register"
            className="relative rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary group"
          >
            <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-primary/50 to-primary/30 opacity-0 group-hover:opacity-100 transition-opacity blur" />
            <span className="relative">無料で始める</span>
          </Link>
          <Link href="/contact" className="text-sm font-semibold leading-6 text-foreground hover:text-primary">
            お問い合わせ <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
} 