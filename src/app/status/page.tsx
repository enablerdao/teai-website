'use client';

import { useState, useEffect } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const services = [
  {
    name: 'API',
    description: 'REST APIエンドポイント',
    status: 'operational',
    uptime: '99.99%',
    latency: '45ms',
  },
  {
    name: 'インスタンス管理',
    description: 'インスタンスの作成、更新、削除',
    status: 'operational',
    uptime: '99.95%',
    latency: '120ms',
  },
  {
    name: 'モデルサービス',
    description: 'AIモデルの推論サービス',
    status: 'operational',
    uptime: '99.90%',
    latency: '250ms',
  },
  {
    name: 'ストレージ',
    description: 'データストレージサービス',
    status: 'operational',
    uptime: '99.99%',
    latency: '85ms',
  },
  {
    name: 'モニタリング',
    description: 'メトリクス収集と分析',
    status: 'operational',
    uptime: '99.95%',
    latency: '150ms',
  },
  {
    name: '認証',
    description: 'ユーザー認証とアクセス制御',
    status: 'operational',
    uptime: '99.99%',
    latency: '65ms',
  },
];

const incidents = [
  {
    date: '2025-03-30',
    title: 'APIレイテンシーの一時的な上昇',
    description: '一部のリージョンでAPIレイテンシーが上昇しました。原因を特定し、対応済みです。',
    status: 'resolved',
    duration: '15分',
  },
  {
    date: '2025-03-25',
    title: 'モデルサービスの部分的な遅延',
    description: '大規模なトラフィック増加により、一部のモデルサービスで遅延が発生しました。スケールアップにより解決しました。',
    status: 'resolved',
    duration: '25分',
  },
];

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-sm font-medium ring-1 ring-inset ${
        status === 'operational'
          ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 ring-green-600/20 dark:ring-green-300/20'
          : 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 ring-yellow-600/20 dark:ring-yellow-300/20'
      }`}
    >
      {status === 'operational' ? (
        <CheckCircleIcon className="mr-1.5 h-4 w-4" />
      ) : (
        <ExclamationTriangleIcon className="mr-1.5 h-4 w-4" />
      )}
      {status === 'operational' ? '正常' : '障害発生中'}
    </span>
  );
}

export default function StatusPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-2xl lg:mx-0">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">システムステータス</h2>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          TeAI.ioの各サービスの稼働状況をリアルタイムで確認できます。
          インシデントやメンテナンス情報も随時更新されます。
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-2xl lg:mx-0 lg:max-w-none">
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* API Status */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">API</h3>
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                正常
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              すべてのAPIエンドポイントが正常に動作しています。
            </p>
            <div className="mt-4 text-xs text-muted-foreground">
              最終更新: 2024-03-21 10:00 JST
            </div>
          </div>

          {/* AI Service Status */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">AIサービス</h3>
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                正常
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              AIモデルとエージェントが正常に動作しています。
            </p>
            <div className="mt-4 text-xs text-muted-foreground">
              最終更新: 2024-03-21 10:00 JST
            </div>
          </div>

          {/* Database Status */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">データベース</h3>
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                正常
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              データベース接続とクエリが正常に動作しています。
            </p>
            <div className="mt-4 text-xs text-muted-foreground">
              最終更新: 2024-03-21 10:00 JST
            </div>
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="mt-16">
          <h3 className="text-xl font-semibold text-foreground">最近のインシデント</h3>
          <div className="mt-6 space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-foreground">メンテナンス完了</h4>
                <span className="text-sm text-muted-foreground">2024-03-20</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                システムメンテナンスが完了し、すべてのサービスが正常に復旧しました。
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-foreground">パフォーマンス改善</h4>
                <span className="text-sm text-muted-foreground">2024-03-19</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                AIサービスの応答速度を改善するための最適化を実施しました。
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-foreground">セキュリティアップデート</h4>
                <span className="text-sm text-muted-foreground">2024-03-18</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                セキュリティ強化のためのシステムアップデートを実施しました。
              </p>
            </div>
          </div>
        </div>

        {/* System Metrics */}
        <div className="mt-16">
          <h3 className="text-xl font-semibold text-foreground">システムメトリクス</h3>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-6">
              <h4 className="text-sm font-medium text-foreground">稼働率</h4>
              <p className="mt-2 text-2xl font-semibold text-foreground">99.99%</p>
              <p className="mt-1 text-xs text-muted-foreground">過去30日間の平均</p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h4 className="text-sm font-medium text-foreground">平均応答時間</h4>
              <p className="mt-2 text-2xl font-semibold text-foreground">120ms</p>
              <p className="mt-1 text-xs text-muted-foreground">APIエンドポイント</p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h4 className="text-sm font-medium text-foreground">アクティブユーザー</h4>
              <p className="mt-2 text-2xl font-semibold text-foreground">1,234</p>
              <p className="mt-1 text-xs text-muted-foreground">現在の同時接続数</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}