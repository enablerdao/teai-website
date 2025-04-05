'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Rocket, Zap, Key, ShieldCheck, CloudOff, Tablet, Copy, GitBranch, Code2, MousePointerClick, ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';

// Animation variants (can reuse from homepage or define new ones)
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function DocsPage() {
  return (
    <div className="bg-background text-foreground">
      <div className="container mx-auto px-4 md:px-6 py-16 md:py-24 lg:py-32">
        
        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-center mb-4">
            Te<span className="text-2xl md:text-3xl lg:text-4xl align-middle">🖐️</span>AI.io ドキュメント
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground text-center max-w-3xl mx-auto mb-12">
            TeAI.io へようこそ！ AI を活用した開発の効率化と、誰でも簡単に開発を始められる環境を提供します。
          </p>
        </motion.div>

        <div className="space-y-16">
          {/* 1. TeAI.ioとは？ */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeIn}>
            <h2 className="text-3xl font-semibold tracking-tight mb-6 border-b pb-2">Te<span className="text-xl align-middle">🖐️</span>AI.io について</h2>
            <p className="text-lg text-muted-foreground mb-4">
              TeAI.io は、AI によるコード生成、コマンド実行、ウェブ操作などを自然言語で指示できる、開発支援に特化したクラウドプラットフォーム (SaaS) です。
              面倒な環境構築や API キーの管理といった手間から開発者を解放し、アイデアの実装に集中できる環境を提供することを目的としています。
            </p>
            <p className="text-lg text-muted-foreground">
              わずか数クリックで、必要なツールがプリインストールされた安全な開発サーバーを起動し、すぐに AI のパワーを活用し始めることができます。
            </p>
          </motion.section>

          {/* 2. 基盤技術 OpenHands */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeIn}>
            <h2 className="text-3xl font-semibold tracking-tight mb-6 border-b pb-2">基盤技術：OpenHands</h2>
            <p className="text-lg text-muted-foreground mb-4">
              TeAI.io の中核を成すのは、強力なオープンソース AI プラットフォームである <a href="https://github.com/All-Hands-AI/OpenHands" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenHands <ExternalLink className="inline-block h-4 w-4 ml-1"/></a> です。
              OpenHands は、大規模言語モデル (LLM) がユーザーのコンピューター環境を理解し、様々なタスクを実行できるように設計されています。
            </p>
            <ul className="list-disc list-inside space-y-2 text-lg text-muted-foreground mb-4 ml-4">
              <li><Code2 className="inline-block h-5 w-5 mr-2 text-primary"/> ファイルシステムの操作、コードの生成・編集・実行</li>
              <li><MousePointerClick className="inline-block h-5 w-5 mr-2 text-primary"/> Web ブラウザの操作（情報収集、フォーム入力など）</li>
              <li><Zap className="inline-block h-5 w-5 mr-2 text-primary"/> コマンドラインインターフェースの操作</li>
            </ul>
            <p className="text-lg text-muted-foreground">
              TeAI.io はこの OpenHands をクラウド上で簡単に利用できるようにし、管理の手間を省きながら、その強力な機能を提供します。
            </p>
          </motion.section>

          {/* 3. TeAI.io だからできること */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeIn}>
            <h2 className="text-3xl font-semibold tracking-tight mb-6 border-b pb-2">Te<span className="text-xl align-middle">🖐️</span>AI.io のメリット</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[ 
                  { title: '超高速セットアップ', icon: Zap, text: '数クリックで開発サーバー起動。環境構築不要。' },
                  { title: '簡単なキー管理', icon: Key, text: '各種 API キーを GUI で安全かつ簡単に管理。' },
                  { title: 'ローカル負荷ゼロ', icon: CloudOff, text: '重い処理はクラウドへ。PC スペックを気にせず開発。' },
                  { title: '場所を選ばない開発', icon: Tablet, text: 'ネット環境があれば、どこからでも、どのデバイスからでも。' },
                  { title: '高速プロトタイピング', icon: Copy, text: '複数インスタンスでアイデアを並行して検証可能。' },
                  { title: '安全な環境', icon: ShieldCheck, text: 'SSH 鍵や IAM ロールでセキュアなアクセスを実現。' },
              ].map((feature, i) => (
                <motion.div key={feature.title} custom={i * 0.1} variants={fadeIn}>
                    <Card className="h-full border-l-4 border-primary bg-card shadow-sm">
                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                           <feature.icon className="h-8 w-8 text-primary" />
                           <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{feature.text}</p>
                        </CardContent>
                    </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* 4. オープンソース */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeIn}>
            <h2 className="text-3xl font-semibold tracking-tight mb-6 border-b pb-2">オープンソースの力</h2>
            <p className="text-lg text-muted-foreground mb-4">
              TeAI.io 自体もオープンソースプロジェクトとして開発されています。これは、特定のベンダーにロックインされる心配がないことを意味します。
              ソースコードは公開されており、誰でもその仕組みを確認し、改善に参加することができます。
            </p>
            <p className="text-lg text-muted-foreground mb-4">
              私たちは、コミュニティと共に TeAI.io をより良くしていくことを目指しています。バグ報告、機能提案、コードの貢献など、あらゆる形での参加を歓迎します。
            </p>
             <Button asChild variant="outline">
                <a href="https://github.com/enablerdao/teai-website" target="_blank" rel="noopener noreferrer">
                   <GitBranch className="mr-2 h-5 w-5" />
                   GitHub リポジトリを見る
                </a>
             </Button>
          </motion.section>

          {/* 5. 面倒なことは AI にお任せ */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeIn}>
            <h2 className="text-3xl font-semibold tracking-tight mb-6 border-b pb-2">面倒な作業は Te<span className="text-xl align-middle">🖐️</span>AI にお任せ</h2>
            <p className="text-lg text-muted-foreground">
              開発プロセスには、環境設定、依存関係の解決、定型的なコードの記述、API キーの管理など、多くの面倒な作業が伴います。
              TeAI.io は、これらの複雑で時間のかかるタスクを AI に任せることで、開発者がより創造的で本質的な作業に集中できるように設計されています。
              「こんなことがしたい」と伝えるだけで、あとは TeAI.io が良きに計らってくれます。
            </p>
          </motion.section>
          
          {/* 6. APIアクセス */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeIn}>
            <h2 className="text-3xl font-semibold tracking-tight mb-6 border-b pb-2">API による操作</h2>
            <p className="text-lg text-muted-foreground mb-4">
              TeAI.io のプラットフォーム自体も、柔軟な連携や自動化を可能にするために API を提供しています。
              これにより、インスタンスの起動・停止・削除、状態の確認などをプログラムから制御できます。
            </p>
             <p className="text-lg text-muted-foreground">
                独自の開発ツールや CI/CD パイプラインに TeAI.io を組み込むことで、より高度な自動化ワークフローを構築することが可能です。
                API の詳細については、今後のドキュメント更新で提供予定です。
             </p>
          </motion.section>

          {/* 7. Call to Action */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={fadeIn} className="text-center pt-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-6">さあ、始めましょう！</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              複雑な手順は一切不要です。今すぐ TeAI.io にログインして、あなたの最初の AI 開発サーバーを立ち上げてみましょう。
            </p>
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
              <Link href="/dashboard">
                <Rocket className="mr-2 h-5 w-5" />
                ダッシュボードへ移動してサーバーを起動
              </Link>
            </Button>
          </motion.section>
        </div>
      </div>
    </div>
  );
}