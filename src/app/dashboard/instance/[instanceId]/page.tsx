'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Square, Trash2, ExternalLink, ArrowLeft, Timer, Globe, Cpu } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar } from '@/components/layout/Sidebar';

interface Instance {
  InstanceId: string;
  Name: string;
  Domain: string;
  InstanceType: string;
  State: string;
  PublicIpAddress?: string;
  LaunchTime: string;
}

function InstanceStatus({ state }: { state: string }) {
  const getStatusColor = (state: string) => {
    switch (state.toLowerCase()) {
      case 'running':
        return 'bg-green-500';
      case 'stopped':
        return 'bg-red-500';
      case 'pending':
      case 'stopping':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${getStatusColor(state)}`} />
      <span className="capitalize text-sm">{state.toLowerCase()}</span>
    </div>
  );
}

function formatInstanceName(name: string): string {
  if (!name) return '';
  const match = name.match(/teai-instance-[a-f0-9-]+-([a-z0-9]+)$/i);
  return match ? match[1].toUpperCase() : name;
}

export default function InstanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [instance, setInstance] = useState<Instance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const instanceId = params.instanceId as string;

  useEffect(() => {
    fetchInstance();
  }, [instanceId]);

  const fetchInstance = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/aws-instance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: 'describe', instanceId }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch instance details');
      }
      setInstance(result.instance);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch instance details');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    setActionLoading(prev => ({ ...prev, [action]: true }));
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/aws-instance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action, instanceId }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to perform action');
      }
      
      if (action === 'terminate') {
        router.push('/dashboard/instances');
        return;
      }
      await fetchInstance();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(prev => ({ ...prev, [action]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 p-4 md:p-8 ml-16">
          <div className="mb-6">
            <Link href="/dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Instances
            </Link>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="h-8 bg-muted rounded w-1/3 animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-1/4 mt-2 animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                        <div className="h-6 bg-muted rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-10 bg-muted rounded w-32 animate-pulse"></div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !instance) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 p-4 md:p-8 ml-16">
          <div className="mb-6">
            <Link href="/dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Instances
            </Link>
          </div>
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>エラー</AlertTitle>
            <AlertDescription>{error || 'インスタンスが見つかりません'}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 ml-16">
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Instances
          </Link>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/instances" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-semibold">{formatInstanceName(instance.Name || instance.InstanceId)}</h1>
            <InstanceStatus state={instance.State} />
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">概要</TabsTrigger>
              <TabsTrigger value="settings">設定</TabsTrigger>
              <TabsTrigger value="logs">ログ</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>インスタンス情報</CardTitle>
                  <CardDescription>インスタンスの基本情報と状態</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>インスタンスID</Label>
                      <div className="font-mono text-sm">{instance.InstanceId}</div>
                    </div>
                    <div className="space-y-2">
                      <Label>インスタンスタイプ</Label>
                      <div className="font-medium">{instance.InstanceType}</div>
                    </div>
                    <div className="space-y-2">
                      <Label>ドメイン</Label>
                      <div className="font-mono text-sm">{instance.Domain || '-'}</div>
                    </div>
                    <div className="space-y-2">
                      <Label>IPアドレス</Label>
                      <div className="font-mono text-sm">{instance.PublicIpAddress || '-'}</div>
                    </div>
                    <div className="space-y-2">
                      <Label>作成日時</Label>
                      <div>{instance.LaunchTime ? formatDistanceToNow(new Date(instance.LaunchTime), { addSuffix: true, locale: ja }) : '-'}</div>
                    </div>
                    <div className="space-y-2">
                      <Label>状態</Label>
                      <InstanceStatus state={instance.State} />
                    </div>
                  </div>

                  <Separator />

                  <div className="flex flex-wrap gap-4">
                    {instance.State === 'stopped' && (
                      <Button
                        onClick={() => handleAction('start')}
                        disabled={actionLoading['start']}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        起動
                      </Button>
                    )}
                    {instance.State === 'running' && (
                      <Button
                        onClick={() => handleAction('stop')}
                        disabled={actionLoading['stop']}
                      >
                        <Square className="w-4 h-4 mr-2" />
                        停止
                      </Button>
                    )}
                    {instance.PublicIpAddress && instance.State === 'running' && (
                      <Button variant="outline" asChild>
                        <a href={`https://${instance.Domain}:3000`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
                          <Image src="/images/openhands-logo.png" alt="OpenHands" width={16} height={16} className="mr-2" />
                          OpenHandsを開く
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      onClick={() => handleAction('terminate')}
                      disabled={actionLoading['terminate']}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      インスタンスを削除
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>インスタンス設定</CardTitle>
                  <CardDescription>インスタンスの設定を変更します</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>サブドメイン</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={instance.Domain?.split('.')[0] || ''} 
                          placeholder="サブドメイン"
                          disabled
                        />
                        <Button variant="outline" disabled>
                          変更
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">※ 現在サブドメインの変更はできません</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>インスタンスログ</CardTitle>
                  <CardDescription>インスタンスのログを表示します</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-md">
                    <p className="text-sm text-muted-foreground">※ 現在ログの表示機能は開発中です</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 