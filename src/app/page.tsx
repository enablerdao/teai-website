'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Zap, Key, ShieldCheck, Rocket, Cpu, Languages, Code2, ExternalLink, BotMessageSquare, MousePointerClick, Github
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { motion } from 'framer-motion';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay }
  })
};

const fadeInFromLeft = {
    hidden: { opacity: 0, x: -30 },
    visible: (delay: number = 0) => ({
        opacity: 1,
        x: 0,
        transition: { duration: 0.7, delay }
    })
};

const fadeInFromRight = {
    hidden: { opacity: 0, x: 30 },
    visible: (delay: number = 0) => ({
        opacity: 1,
        x: 0,
        transition: { duration: 0.7, delay }
    })
};

const staggerContainer = {
  hidden: { opacity: 1 }, // Start container visible
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Stagger child animations
    }
  }
};

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full pt-24 pb-16 md:pt-36 md:pb-24 lg:pt-48 lg:pb-32 xl:pt-56 xl:pb-40 bg-gradient-to-b from-background via-primary/5 to-background relative overflow-hidden">
          {/* Grid Background */}
          <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)] opacity-50"></div>

          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
              <motion.div 
                variants={fadeInFromLeft}
                initial="hidden"
                animate="visible"
                custom={0.1}
                className="flex flex-col justify-center space-y-6"
              >
                <div className="inline-block w-auto">
                   <Logo /> 
                </div>
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl xl:text-7xl/none">
                     AI開発を、<span className="text-primary">もっと手軽に、もっと賢く。</span><br/>
                     Te手AIで、アイデアを高速実装。
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Te手AIは、AIによるコード生成・コマンド実行・ウェブ操作を自然言語で指示できる開発支援SaaSです。
                    **APIがないサービスもブラウザ操作で自動化可能**。面倒なセットアップやキー管理から解放され、すぐに開発に集中できます。
                  </p>
                </div>
                <motion.div 
                   variants={fadeIn} custom={0.5}
                   initial="hidden" animate="visible"
                   className="flex flex-col gap-3 min-[400px]:flex-row"
                >
                  <Button size="lg" asChild className="shadow-lg hover:shadow-primary/30 transition-shadow">
                    <Link href="/login">
                      <Rocket className="mr-2 h-5 w-5" />
                      今すぐ無料で始める
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/docs">ドキュメントを見る</Link>
                  </Button>
                </motion.div>
              </motion.div>
              <motion.div 
                 variants={fadeInFromRight} custom={0.2}
                 initial="hidden" animate="visible"
                 className="flex items-center justify-center lg:order-last"
               >
                 {/* Enhanced Visual */}
                 <div className="relative w-full max-w-lg aspect-video p-4">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/10 rounded-2xl blur-xl opacity-50"></div>
                     <Card className="relative z-10 shadow-xl overflow-hidden">
                         <CardHeader className="p-2 bg-muted/50 border-b">
                             <div className="flex items-center space-x-1.5">
                                 <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                 <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                                 <span className="w-3 h-3 rounded-full bg-green-500"></span>
                             </div>
                         </CardHeader>
                         <CardContent className="p-4 text-sm font-mono bg-background text-muted-foreground h-64 overflow-y-auto">
                             <p><span className="text-primary">&gt; Teai:</span> Webサイトから最新の株価を取得してレポートを作成して。</p>
                             <p className="mt-2"><span className="text-green-500">Teai:</span> 了解しました。指定されたWebサイトにアクセスし、株価情報を抽出します...</p>
                             <p><span className="text-green-500">Teai:</span> ...情報を取得し、レポートを作成しました。ファイルを確認してください。</p>
                             <p className="mt-4"><span className="text-primary">&gt; Teai:</span> ありがとう！次に、取得したデータでグラフを生成するPythonコードを書いて。
                             </p>
                             <p className="mt-2"><span className="text-green-500">Teai:</span> はい、データを視覚化するためのPythonコードを生成します...</p>
                             <pre className="mt-2 p-2 bg-muted rounded text-xs"><code>import matplotlib.pyplot as plt

# (生成されたコード...)</code></pre>
                         </CardContent>
                     </Card>
                 </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* What is Teai Section */}
        <section className="w-full py-16 md:py-24 lg:py-32">
            <motion.div 
                initial="hidden" whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeIn} custom={0.1}
                className="container px-4 md:px-6 text-center"
            >
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">Te手AIとは？</h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mb-10">
                    オープンソースのAIプラットフォーム「OpenHands」を基盤に、ソフトウェア開発の効率化と生産性向上を実現するSaaSソリューションです。
                    **複雑なセットアップは不要**。すぐにAIのパワーを活用できます。
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[ 
                        { icon: Code2, title: "コード生成・修正", desc: "AIがコードを自動生成し、バグ修正や最適化も支援します。" },
                        { icon: Cpu, title: "コマンドライン操作", desc: "システムタスクやファイル管理などをAIが自動で実行します。" },
                        { icon: MousePointerClick, title: "ウェブ操作自動化", desc: "必要な情報を収集したり、**APIがなくても**ブラウザ操作を代行します。" },
                        { icon: Languages, title: "自然言語インターフェース", desc: "技術者でなくても、自然な言葉でAIと対話し、操作を指示できます。" },
                    ].map((item, i) => (
                        <motion.div key={item.title} variants={fadeIn} custom={0.2 + i * 0.1}>
                            <Card className="h-full text-left bg-muted/30 hover:bg-muted/50 transition-colors">
                                <CardHeader>
                                    <item.icon className="h-8 w-8 mb-2 text-primary" />
                                    <CardTitle className="text-lg">{item.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>

        {/* Features/Why Section */}
        <section id="features" className="w-full py-16 md:py-24 lg:py-32 bg-muted/40">
          <motion.div 
            initial="hidden" whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="container px-4 md:px-6"
           >
             <motion.div variants={fadeIn} className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-background px-3 py-1 text-sm">キーポイント</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Teaiが選ばれる理由</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  開発のボトルネックを解消し、アイデアの実現を加速します。
                </p>
              </div>
            </motion.div>
            <div className="mx-auto grid items-start gap-8 sm:max-w-4xl sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-3">
              {[ 
                { title: '超高速セットアップ', icon: Zap, text: 'わずか3クリックで、ツールプリインストールの開発サーバーを起動。セットアップ不要ですぐ開始。' },
                { title: '簡単なキー管理', icon: Key, text: 'OpenAI, Anthropic, AWS等のAPIキーをGUIで安全かつ簡単に管理・設定。', link: '/dashboard/api-keys' },
                { title: 'API不要のブラウザ操作', icon: MousePointerClick, text: 'APIが提供されていないサービスでも、ブラウザ操作を指示して自動化できます。' },
                { title: 'パワフルなAI機能', icon: BotMessageSquare, text: 'コード生成・修正、コマンド実行、Webブラウジングなど、AIが開発作業を強力に支援。' },
                { title: '自然言語で操作', icon: Languages, text: '専門知識がなくても大丈夫。普段の言葉でAIに指示を出せます。' },
                { title: '安全な環境', icon: ShieldCheck, text: 'SSH公開鍵認証やAWS IAMロールで、セキュアなアクセス制御を実現。' },
              ].map((feature) => (
                <motion.div key={feature.title} variants={fadeIn} >
                    <Card className="h-full hover:shadow-lg transition-shadow hover:border-primary/50 transform hover:-translate-y-1">
                        <CardHeader className="pb-3">
                           <feature.icon className="h-6 w-6 mb-2 text-primary" />
                           <CardTitle className="text-base font-semibold">{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                {feature.text}
                                {feature.link && <Link href={feature.link} className="text-xs text-primary hover:underline ml-1">詳細</Link>}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Reliability Section */}
        <section className="w-full py-16 md:py-24 lg:py-32">
            <motion.div 
                initial="hidden" whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={staggerContainer}
                className="container px-4 md:px-6 text-center"
            >
                <motion.div variants={fadeIn}>
                    <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm mb-4">信頼の基盤技術</div>
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">OSS「OpenHands」を採用</h2>
                    <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mb-8">
                        Teaiは、世界中の開発者から高い評価を得ているオープンソースAIプラットフォーム「OpenHands」を基盤としています。
                        その安定性と先進性が、Teaiの信頼性を支えています。
                    </p>
                    <div className="flex justify-center items-center space-x-6">
                        <a href="https://github.com/All-Hands-AI/OpenHands" target="_blank" rel="noopener noreferrer" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
                            <Github className="h-5 w-5 mr-2" /> GitHub (51k+ Stars)
                        </a>
                        <a href="https://arxiv.org/abs/2407.16741" target="_blank" rel="noopener noreferrer" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
                            <ExternalLink className="h-5 w-5 mr-2" /> 論文 (arXiv)
                        </a>
                    </div>
                </motion.div>
            </motion.div>
        </section>

        {/* Future Section */}
        <section className="w-full py-16 md:py-24 lg:py-32 bg-muted/30">
            <motion.div 
                initial="hidden" whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeIn}
                className="container grid items-center justify-center gap-4 px-4 text-center md:px-6"
            >
                <div className="space-y-3">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">今後の展開：業界特化型AIエージェント</h2>
                    <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        将来的には、医療、金融、製造業など、各業界の特有な課題に対応した専門的なAIエージェントを提供予定です。
                        Teaiは、業界全体のイノベーションを加速する存在を目指します。
                    </p>
                </div>
            </motion.div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-16 md:py-24 lg:py-32">
            <motion.div 
                initial="hidden" whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={fadeIn}
                className="container grid items-center justify-center gap-4 px-4 text-center md:px-6"
            >
                <div className="space-y-3">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">AI開発の未来を、今すぐ体験</h2>
                    <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        Teaiで開発プロセスを効率化し、創造的な作業に集中しましょう。
                    </p>
                </div>
                <div className="mt-6">
                    <Button size="lg" asChild className="shadow-lg hover:shadow-primary/30 transition-shadow">
                        <Link href="/login">
                        <Rocket className="mr-2 h-5 w-5" />
                        今すぐ無料でサーバーを立ち上げる
                        </Link>
                    </Button>
                </div>
            </motion.div>
        </section>

      </main>
      {/* Footer */}
      <footer className="border-t py-6 md:py-8 w-full">
          <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
             <div className="flex items-center gap-2">
                <Logo />
                <span className="text-sm font-semibold">Teai by enabler Inc.</span>
             </div>
             <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} enabler Inc. All rights reserved.</p>
             {/* Optional: Add links to terms/privacy */}
             {/* <nav className="flex gap-4 sm:gap-6"> */}
             {/*   <Link href="/legal/terms" className="text-xs hover:underline underline-offset-4">Terms</Link> */}
             {/*   <Link href="/legal/privacy-policy" className="text-xs hover:underline underline-offset-4">Privacy</Link> */}
             {/* </nav> */}
          </div>
      </footer>
    </div>
  );
}

// Add CSS for animations in globals.css or using styled-components/tailwind plugin
/*
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin-slow {
  animation: spin-slow 20s linear infinite;
}
@keyframes spin-slow-reverse {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}
.animate-spin-slow-reverse {
  animation: spin-slow-reverse 25s linear infinite;
}
*/