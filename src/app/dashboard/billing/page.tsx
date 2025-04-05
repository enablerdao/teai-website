'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from 'sonner';
import { Loader2, Info, Eye, EyeOff, ExternalLink, AlertCircle, Terminal, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";

interface BillingLog {
  date: string;
  service: string;
  cost: number;
}

interface AwsCosts {
  ec2: number;
  lambda: number;
  other: number;
  total: number;
}

interface PurchaseHistoryEntry {
    id: string;
    created_at: string;
    amount_yen: number;
    credits: number;
    status: string;
    stripe_session_id: string;
}

const CREDIT_RATE = 5; // 1円 = 5 Credit

const CREDIT_PLANS = [
  { id: 'basic', credits: 5000, amount: 1000, name: 'ベーシック' },
  { id: 'standard', credits: 15000, amount: 2500, name: 'スタンダード' },
  { id: 'pro', credits: 50000, amount: 7000, name: 'プロフェッショナル' },
  { id: 'business', credits: 200000, amount: 25000, name: 'ビジネス' }
];

export default function BillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  
  const [loading, setLoading] = useState({ credits: true, awsCost: true, history: true });
  const [error, setError] = useState({ credits: null, awsCost: null, history: null });
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);

  // Billing specific state
  const [creditBalanceYen, setCreditBalanceYen] = useState<number | null>(null);
  const [awsCosts, setAwsCosts] = useState<AwsCosts | null>(null);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistoryEntry[]>([]);

  useEffect(() => {
    const setLoadingState = (key: keyof typeof loading, value: boolean) => setLoading(prev => ({ ...prev, [key]: value }));
    const setErrorState = (key: keyof typeof error, value: string | null) => setError(prev => ({ ...prev, [key]: value }));

    const fetchCreditBalance = async () => {
      setLoadingState('credits', true);
      setErrorState('credits', null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found.");
        const { data, error: dbError } = await supabase
          .from('user_credits')
          .select('balance')
          .eq('user_id', user.id)
          .single();
        if (dbError && dbError.code !== 'PGRST116') throw dbError;
        setCreditBalanceYen(data?.balance ?? 0);
      } catch (err: any) {
        console.error("Error fetching credit balance:", err);
        setErrorState('credits', err.message || "クレジット残高の取得エラー");
      } finally {
        setLoadingState('credits', false);
      }
    };

    const fetchAwsCost = async () => {
        setLoadingState('awsCost', true);
        setErrorState('awsCost', null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('認証されていません');

            const response = await fetch('/api/aws-cost', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error + (data.details ? `\n詳細: ${data.details}` : ''));
            }
            setAwsCosts(data.costs);
        } catch (err) {
            console.error("Error fetching AWS costs:", err);
            const errorMessage = err instanceof Error ? err.message : "AWS利用料金の取得エラー";
            setErrorState('awsCost', errorMessage);
        } finally {
            setLoadingState('awsCost', false);
        }
    };

    const fetchPurchaseHistory = async () => {
      setLoadingState('history', true);
      setErrorState('history', null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found for history.");
        const { data, error: dbError } = await supabase
          .from('credit_purchase_history')
          .select('id, created_at, amount_yen, credits, status, stripe_session_id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (dbError) throw dbError;
        setPurchaseHistory(data || []);
      } catch (err: any) {
        console.error("Error fetching purchase history:", err);
        setErrorState('history', err.message || "購入履歴の取得エラー");
      } finally {
        setLoadingState('history', false);
      }
    };

    // Check for payment status from URL params
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    if (success) {
      toast.success('クレジットの購入が完了しました！残高の反映まで少々お待ちください。');
      router.replace('/dashboard/billing'); // Clear params
    } else if (canceled) {
      toast.error('クレジットの購入がキャンセルされました。');
      router.replace('/dashboard/billing'); // Clear params
    }

    fetchCreditBalance();
    fetchAwsCost();
    fetchPurchaseHistory();
  }, [supabase, searchParams, router]);

  const creditBalance = creditBalanceYen !== null ? creditBalanceYen * CREDIT_RATE : null;

  const handlePurchase = async (planId: string) => {
    setPurchaseLoading(planId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('認証されていません。再度ログインしてください');
        return;
      }
      const response = await fetch(
        `https://vtjkhwlqmgsxjknggvnl.supabase.co/functions/v1/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          },
          body: JSON.stringify({ planId }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || 'クレジットの購入処理中にエラーが発生しました');
        return;
      }
      if (!data.url) {
        toast.error('チェックアウトURLの取得に失敗しました');
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      console.error('クレジット購入エラー:', err);
      toast.error('クレジットの購入処理中にエラーが発生しました。しばらく待ってから再度お試しください');
    } finally {
      setPurchaseLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">課金情報</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* クレジット残高カード */}
        <Card>
          <CardHeader>
            <CardTitle>現在のクレジット残高</CardTitle>
          </CardHeader>
          <CardContent>
            {loading.credits ? (
              <div className="flex items-center space-x-2 text-muted-foreground">
                 <Loader2 className="h-4 w-4 animate-spin" /> <span>読み込み中...</span>
              </div>
            ) : error.credits ? (
              <Alert variant="destructive" className="mb-0">
                <Terminal className="h-4 w-4" />
                <AlertTitle>エラー</AlertTitle>
                <AlertDescription>{error.credits}</AlertDescription>
              </Alert>
            ) : (
              <div className="text-4xl font-bold">
                {creditBalance !== null ? creditBalance.toLocaleString() : '-'} <span className="text-lg font-normal text-muted-foreground">Credit</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AWS利用料金カード */}
        <Card>
          <CardHeader>
            <CardTitle>当月のAWS利用料金（目安）</CardTitle>
          </CardHeader>
          <CardContent>
            {loading.awsCost ? (
                <div className="flex items-center space-x-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> <span>読み込み中...</span>
                </div>
            ) : error.awsCost ? (
                <Alert variant="destructive" className="mb-0">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>AWS利用料金取得エラー</AlertTitle>
                    <AlertDescription className="whitespace-pre-wrap">{error.awsCost}</AlertDescription>
                </Alert>
            ) : awsCosts ? (
                <div className="text-4xl font-bold">
                    ¥{awsCosts.total.toLocaleString()} 
                    <span className="text-sm font-normal text-muted-foreground block mt-1">
                      (インスタンス: ¥{awsCosts.ec2.toLocaleString()}, API: ¥{awsCosts.lambda.toLocaleString()}, その他: ¥{awsCosts.other.toLocaleString()})
                    </span>
                </div>
            ) : (
                <p className="text-muted-foreground">データがありません。</p>
            )}
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground pt-0">
            AWS Cost Explorerの情報を元に算出。実際の請求額とは異なる場合があります。
          </CardFooter>
        </Card>
      </div>

      {/* クレジット購入セクション */}
      <Card>
        <CardHeader>
          <CardTitle>クレジットの購入</CardTitle>
          <CardDescription>必要なクレジット数に応じてプランをお選びください</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CREDIT_PLANS.map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.credits.toLocaleString()} クレジット</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">¥{plan.amount.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    (1クレジットあたり ¥{(plan.amount / plan.credits).toFixed(3)})
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => handlePurchase(plan.id)}
                    disabled={purchaseLoading === plan.id}
                  >
                    {purchaseLoading === plan.id ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 処理中...</>
                    ) : ('購入する')}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          <Info className="h-4 w-4 mr-2 flex-shrink-0" />
          クレジットの有効期限は購入日から1年間です。お支払いはStripeを通じて安全に行われます。
        </CardFooter>
      </Card>

      {/* 購入履歴セクション */}
      <Card>
        <CardHeader>
          <CardTitle>購入履歴</CardTitle>
          <CardDescription>過去のクレジット購入履歴を確認できます。</CardDescription>
        </CardHeader>
        <CardContent>
          {loading.history ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
               <Loader2 className="h-5 w-5 animate-spin mr-2" /> 読み込み中...
            </div>
          ) : error.history ? (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>購入履歴の取得エラー</AlertTitle>
              <AlertDescription>{error.history}</AlertDescription>
            </Alert>
          ) : purchaseHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>購入日時</TableHead>
                  <TableHead>クレジット数</TableHead>
                  <TableHead>支払額</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead className="text-right">StripeセッションID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{format(new Date(item.created_at), 'yyyy/MM/dd HH:mm')}</TableCell>
                    <TableCell>{item.credits.toLocaleString()} Credit</TableCell>
                    <TableCell>¥{item.amount_yen.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>
                        {item.status === 'completed' ? <CheckCircle className="mr-1 h-3 w-3"/> : null}
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">{item.stripe_session_id}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-6">購入履歴はありません。</p>
          )}
        </CardContent>
      </Card>

    </div>
  );
} 