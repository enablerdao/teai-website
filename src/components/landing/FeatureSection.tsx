import { features } from '@/config/landing';

export function FeatureSection() {
  return (
    <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-56 lg:px-8">
      <div className="mx-auto max-w-2xl lg:text-center">
        <h2 className="text-base font-semibold leading-7 text-primary">より速く、より簡単に</h2>
        <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          OpenHandsをクラウドで
        </p>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          インフラ管理の煩わしさから解放され、アプリケーション開発に集中できます。
          スケーリング、監視、バックアップなど、すべておまかせください。
        </p>
      </div>
      <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.name} className="relative flex flex-col group">
              <div className="absolute -inset-4 rounded-xl bg-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              <dt className="relative flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  {feature.icon}
                </div>
                {feature.name}
              </dt>
              <dd className="relative mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                <p className="flex-auto">{feature.description}</p>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
} 