import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { HeroSection } from '@/components/landing/HeroSection';
import { FeatureSection } from '@/components/landing/FeatureSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { CtaSection } from '@/components/landing/CtaSection';

export default function Home() {
  return (
    <div className="bg-background">
      {/* Background decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
        <div className="absolute -top-[50vh] left-0 right-0 h-[200vh]" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.05) 0%, rgba(99, 102, 241, 0) 100%)' }} />
        <div className="absolute inset-x-0 top-0 h-96 blur-[100px] bg-gradient-to-b from-indigo-100/20 dark:from-indigo-900/30" />
        <div className="absolute -left-[50vw] top-0 h-[200vh] w-[100vw] bg-[linear-gradient(to_right,transparent_1px,transparent_1px),linear-gradient(to_bottom,transparent_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#0B1120_1px,transparent_1px),linear-gradient(to_bottom,#0B1120_1px,transparent_1px)] bg-[size:4rem_4rem] dark:bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      {/* Hero section */}
      <HeroSection />

      {/* Feature section */}
      <FeatureSection />

      {/* Pricing section */}
      <PricingSection />

      {/* CTA section */}
      <CtaSection />
    </div>
  );
}