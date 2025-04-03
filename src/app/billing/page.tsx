'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';

interface BillingInfo {
  plan: string;
  amount: number;
  nextBillingDate: string;
  status: 'active' | 'inactive' | 'past_due';
}

interface Usage {
  apiCalls: number;
  storage: number;
  compute: number;
}

export default function BillingPage() {
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    plan: 'Free',
    amount: 0,
    nextBillingDate: new Date().toISOString(),
    status: 'active'
  });
  const [usage, setUsage] = useState<Usage>({
    apiCalls: 0,
    storage: 0,
    compute: 0
  });

  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchBillingInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // TODO: 実際の課金情報取得処理を実装
        // const { data } = await supabase.from('billing').select('*').eq('user_id', user.id).single();
        // if (data) {
        //   setBillingInfo(data);
        // }
      }
    };

    fetchBillingInfo();
  }, []);

  const plans = [
    {
      name: 'Free',
      price: '¥0',
      features: [
        'APIコール: 1,000回/月',
        'ストレージ: 1GB',
        '計算リソース: 基本',
        'サポート: コミュニティ'
      ]
    },
    {
      name: 'Pro',
      price: '¥5,000',
      features: [
        'APIコール: 10,000回/月',
        'ストレージ: 10GB',
        '計算リソース: 高性能',
        'サポート: ビジネス時間内'
      ]
    },
    {
      name: 'Enterprise',
      price: '要相談',
      features: [
        'APIコール: 無制限',
        'ストレージ: カスタム',
        '計算リソース: 最高性能',
        'サポート: 24/7'
      ]
    }
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">課金・プラン</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>現在のプラン</CardTitle>
            <CardDescription>
              プラン: {billingInfo.plan}
              {billingInfo.status === 'active' && ' (アクティブ)'}
              {billingInfo.status === 'past_due' && ' (支払い期限超過)'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-2xl font-bold">¥{billingInfo.amount.toLocaleString()}/月</p>
                <p className="text-sm text-gray-500">
                  次回請求日: {new Date(billingInfo.nextBillingDate).toLocaleDateString()}
                </p>
              </div>
              <Button variant="outline">請求履歴を表示</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>使用状況</CardTitle>
            <CardDescription>今月の使用状況</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">APIコール</p>
                <p className="text-2xl font-bold">{usage.apiCalls.toLocaleString()}回</p>
              </div>
              <div>
                <p className="text-sm font-medium">ストレージ使用量</p>
                <p className="text-2xl font-bold">{usage.storage.toLocaleString()}GB</p>
              </div>
              <div>
                <p className="text-sm font-medium">計算リソース使用量</p>
                <p className="text-2xl font-bold">{usage.compute.toLocaleString()}時間</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.name}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.price}/月</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="text-sm">
                      ✓ {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-4" variant={plan.name === billingInfo.plan ? 'outline' : 'default'}>
                  {plan.name === billingInfo.plan ? '現在のプラン' : 'アップグレード'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 