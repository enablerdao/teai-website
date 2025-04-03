import Link from 'next/link'
import { plans } from '@/config/landing';

export function PricingSection() {
  return (
    <div className="py-24 sm:pt-48">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">料金プラン</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            シンプルな料金体系
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-muted-foreground">
          プロジェクトの規模に合わせて選べる、柔軟な料金プランをご用意しました。
          まずは無料プラン、または Pro プランの14日間無料トライアルから、リスクなくお試しいただけます。
        </p>
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {plans.map((plan, planIdx) => (
            <div
              key={plan.name}
              className={`relative flex flex-col justify-between rounded-3xl bg-card p-8 ring-1 ring-border backdrop-blur-sm xl:p-10 ${
                planIdx === 1 ? 'lg:z-10 lg:rounded-b-none' : ''
              } ${planIdx === 0 ? 'lg:rounded-r-none' : ''} ${
                planIdx === 2 ? 'lg:rounded-l-none' : ''
              }`}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3 className="text-lg font-semibold leading-8 text-foreground">{plan.name}</h3>
                  {planIdx === 1 ? (
                    <p className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold leading-5 text-primary">
                      Most popular
                    </p>
                  ) : null}
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">{plan.description}</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-foreground">{plan.price}</span>
                  {planIdx !== 2 && <span className="text-sm font-semibold leading-6 text-muted-foreground">/月</span>}
                </p>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-muted-foreground">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <svg className="h-6 w-5 flex-none text-primary" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href={plan.href}
                className={`relative mt-8 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  planIdx === 1
                    ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline-primary'
                    : 'text-primary ring-1 ring-inset ring-border hover:ring-primary/40'
                }`}
              >
                <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 