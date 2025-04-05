'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Terminal, PlayIcon as LucidePlay, MoreVertical, ExternalLink, Play, Square, Trash2 } from "lucide-react";
import { PlayIcon, StopIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// --- Interfaces ---
interface Instance {
  InstanceId: string;
  Name: string;
  Domain: string;
  InstanceType: string;
  State: string;
  PublicIpAddress?: string;
  LaunchTime: string;
}

interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  environment: 'production' | 'staging';
}

// --- Helper Components & Functions (Copied/Adapted from instances/page) ---
function InstanceStatus({ state }: { state: string }) {
  const getStatusColor = (state: string) => {
    switch (state.toLowerCase()) {
      case 'running': return 'bg-green-500';
      case 'stopped': return 'bg-red-500';
      case 'pending': case 'stopping': return 'bg-yellow-500';
      default: return 'bg-gray-500';
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

// Modify InstanceActionsSummary to accept actionLoading state
function InstanceActionsSummary({ 
  instance,
  onAction,
  actionLoading // Add actionLoading prop
}: { 
  instance: Instance,
  onAction: (action: string, instanceId: string) => Promise<void>,
  actionLoading: Record<string, boolean> // Define prop type
}) {
  // Check loading state directly from the prop
  const isLoading = (action: string) => {
     return !!actionLoading[`${instance.InstanceId}-${action}`];
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={"/dashboard/instances"}> 
            <ExternalLink className="w-4 h-4 mr-2" />
            詳細ページへ
          </Link>
        </DropdownMenuItem>
        {instance.State === 'stopped' && (
          <DropdownMenuItem onClick={() => onAction('start', instance.InstanceId)} disabled={isLoading('start')}>
            <Play className="w-4 h-4 mr-2" />
            起動
          </DropdownMenuItem>
        )}
        {instance.State === 'running' && (
          <DropdownMenuItem onClick={() => onAction('stop', instance.InstanceId)} disabled={isLoading('stop')}>
            <Square className="w-4 h-4 mr-2" />
            停止
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => onAction('terminate', instance.InstanceId)} className="text-red-600 hover:!text-red-600 focus:text-red-600" disabled={isLoading('terminate')}>
          <Trash2 className="w-4 h-4 mr-2" />
          削除
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const CREDIT_RATE = 5; // 1円 = 5 Credit

// --- Main Dashboard Component ---
export default function DashboardPage() {
  // Instance State
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loadingInstances, setLoadingInstances] = useState(true);
  const [errorInstances, setErrorInstances] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  // API Key State
  const [apiKeyCount, setApiKeyCount] = useState<number | null>(null);
  const [loadingApiKeys, setLoadingApiKeys] = useState(true);
  const [errorApiKeys, setErrorApiKeys] = useState<string | null>(null);

  // Billing State
  const [creditBalanceYen, setCreditBalanceYen] = useState<number | null>(null);
  const [loadingCredits, setLoadingCredits] = useState(true);
  const [errorCredits, setErrorCredits] = useState<string | null>(null);

  const supabase = createClientComponentClient();
  const router = useRouter();

  // --- Data Fetching ---
  useEffect(() => {
    fetchInstances();
    fetchApiKeySummary();
    fetchCreditBalance();
  }, []);

  const fetchInstances = async () => {
    setLoadingInstances(true);
    setErrorInstances(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/aws-instance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: 'list' }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Failed to fetch instances');
      setInstances(data.instances || []);
    } catch (err) {
      setErrorInstances(err instanceof Error ? err.message : 'Failed to fetch instances');
      setInstances([]);
    } finally {
      setLoadingInstances(false);
    }
  };

  const fetchApiKeySummary = async () => {
    setLoadingApiKeys(true);
    setErrorApiKeys(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      setApiKeyCount(3); // Placeholder count
    } catch (err) {
      console.error("Error fetching API key summary:", err);
      setErrorApiKeys(err instanceof Error ? err.message : 'APIキー概要の取得に失敗しました。');
      setApiKeyCount(0);
    } finally {
      setLoadingApiKeys(false);
    }
  };

  const fetchCreditBalance = async () => {
    setLoadingCredits(true);
    setErrorCredits(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found.");
      const { data, error: dbError } = await supabase
        .from('user_credits')
        .select('balance')
        .eq('user_id', user.id)
        .single();
      if (dbError) throw dbError;
      setCreditBalanceYen(data?.balance ?? 0);
    } catch (err: any) {
      console.error("Error fetching credit balance:", err);
      setErrorCredits(err.message || "クレジット残高の取得中にエラーが発生しました。");
    } finally {
      setLoadingCredits(false);
    }
  };

  // --- Instance Actions Handler (Re-introduced) ---
  const setInstanceActionLoading = (instanceId: string, action: string, isLoading: boolean) => {
    setActionLoading(prev => ({
      ...prev,
      [`${instanceId}-${action}`]: isLoading,
    }));
  };

  const handleAction = async (action: string, instanceId: string) => {
    // Don't handle 'create' here, it's done by the main button
    if (action === 'create') return;

    setInstanceActionLoading(instanceId, action, true);
    setErrorInstances(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/aws-instance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ action, instanceId }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to perform action');
      }
      await fetchInstances(); // Refresh list after action
    } catch (err) {
      setErrorInstances(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setInstanceActionLoading(instanceId, action, false);
    }
  };

  // --- handleCreateInstance remains the same ---
  const handleCreateInstance = async () => {
    setActionLoading(prev => ({ ...prev, 'global-create': true }));
    setErrorInstances(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/aws-instance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: 'create', instanceId: '' }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create instance');
      }
      await fetchInstances();
    } catch (err) {
      setErrorInstances(err instanceof Error ? err.message : 'An error occurred during creation');
    } finally {
       setActionLoading(prev => ({ ...prev, 'global-create': false }));
    }
  };

  const isCreateLoading = !!actionLoading['global-create'];
  const creditBalance = creditBalanceYen !== null ? creditBalanceYen * CREDIT_RATE : null;

  // Limit instances shown on dashboard
  const dashboardInstances = instances.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* --- Instances Card --- */} 
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>インスタンス</CardTitle>
              <CardDescription>OpenHands インスタンスの概要</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
               <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href="/dashboard/instances">すべてのインスタンスを表示</Link>
               </Button>
               <Button
                className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                onClick={handleCreateInstance}
                disabled={isCreateLoading || Object.values(actionLoading).some(val => val && val !== actionLoading['global-create'])}
              >
                {isCreateLoading ? <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" /> : <LucidePlay className="w-5 h-5 mr-2" />}
                新規作成
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {errorInstances && (
            <div className="p-4">
               <Alert variant="destructive">
                 <Terminal className="h-4 w-4" />
                 <AlertTitle>インスタンスエラー</AlertTitle>
                 <AlertDescription>{errorInstances}</AlertDescription>
               </Alert>
            </div>
          )}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead className="text-right">Open</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingInstances ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                       <ArrowPathIcon className="w-6 h-6 animate-spin text-primary inline-block" />
                    </TableCell>
                  </TableRow>
                ) : dashboardInstances.length > 0 ? (
                  dashboardInstances.map((instance) => (
                    <TableRow key={instance.InstanceId} className="hover:bg-muted/50">
                      <TableCell className="font-medium py-3">
                         {formatInstanceName(instance.Name || instance.InstanceId)}
                      </TableCell>
                      <TableCell className="py-3">
                        <InstanceStatus state={instance.State} />
                      </TableCell>
                      <TableCell className="py-3 truncate max-w-xs">
                         {instance.Domain || '-'}
                      </TableCell>
                      <TableCell className="text-right py-3">
                       {instance.PublicIpAddress && instance.State === 'running' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-8 px-2"
                          >
                            <a href={`https://${instance.Domain}:3000`} target="_blank" rel="noopener noreferrer">
                               <Image src="/images/openhands-logo.png" alt="OpenHands" width={16} height={16} />
                            </a>
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" disabled className="h-8 px-2">
                             <Image src="/images/openhands-logo.png" alt="OpenHands" width={16} height={16} className="opacity-50"/>
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-right py-3">
                        <InstanceActionsSummary 
                          instance={instance} 
                          onAction={handleAction} 
                          actionLoading={actionLoading} 
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      アクティブなインスタンスはありません。
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
             {instances.length > 3 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                   <Link href="/dashboard/instances" className="text-primary hover:underline">
                      さらに {instances.length - 3} 件のインスタンスを表示...
                   </Link>
                </div>
             )}
          </div>
        </CardContent>
      </Card>

      {/* --- Row for API Keys & Billing --- */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* API Keys Card */} 
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                 <CardTitle>環境変数・鍵</CardTitle>
                 <CardDescription>APIキーと環境変数の概要</CardDescription>
              </div>
               <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/api-keys">管理ページへ</Link>
               </Button>
            </div>
          </CardHeader>
          <CardContent>
             {errorApiKeys && (
               <Alert variant="destructive" className="mb-4">
                 <Terminal className="h-4 w-4" />
                 <AlertTitle>APIキーエラー</AlertTitle>
                 <AlertDescription>{errorApiKeys}</AlertDescription>
               </Alert>
             )}
             {loadingApiKeys ? (
                <p className="text-sm text-muted-foreground">概要を読み込み中...</p>
             ) : (
                <p>現在 <span className="font-bold text-lg">{apiKeyCount ?? 0}</span> 個のAPIキーが設定されています。</p>
             )
             }
          </CardContent>
        </Card>

        {/* Billing Card */} 
        <Card>
          <CardHeader>
             <div className="flex justify-between items-start">
                 <div>
                     <CardTitle>課金情報</CardTitle>
                     <CardDescription>現在のクレジット残高</CardDescription>
                 </div>
                 <Button asChild variant="outline" size="sm">
                     <Link href="/dashboard/billing">詳細情報へ</Link>
                 </Button>
             </div>
          </CardHeader>
          <CardContent>
             {errorCredits && (
                <Alert variant="destructive" className="mb-4">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>クレジットエラー</AlertTitle>
                  <AlertDescription>{errorCredits}</AlertDescription>
                </Alert>
             )}
             {loadingCredits ? (
                 <p className="text-sm text-muted-foreground">クレジット残高を読み込み中...</p>
             ) : (
                 <div className="text-3xl font-bold">
                     {creditBalance !== null ? creditBalance.toLocaleString() : '-'} <span className="text-lg font-normal text-muted-foreground">Credit</span>
                 </div>
             )}
             {/* <p className="text-xs text-muted-foreground mt-2">当月のAWS利用料金（目安）: $XXX.XX</p> */} 
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
