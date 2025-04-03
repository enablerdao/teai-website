'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { PlayIcon, StopIcon, ArrowPathIcon, TrashIcon, LinkIcon } from '@heroicons/react/24/outline';
import { Sidebar } from '@/components/layout/Sidebar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"; // For Alert icon
import { formatDistanceToNow } from 'date-fns'; // For relative time
import { ja } from 'date-fns/locale'; // For Japanese locale

interface Instance {
  InstanceId: string;
  InstanceType: string;
  State: string;
  PublicIpAddress?: string;
  LaunchTime: string;
  AccessUrl?: string;
  Tags?: Array<{
    Key: string;
    Value: string;
  }>;
}

interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  environment: 'production' | 'staging';
}

export default function DashboardPage() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [envVars, setEnvVars] = useState<EnvironmentVariable[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchInstances();
  }, []);

  const fetchInstances = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/aws-instance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: 'list' }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Server responded with status ${response.status}`);
      if (!data.success) throw new Error(data.error || 'Failed to fetch instances');
      setInstances(data.instances || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch instances');
      setInstances([]);
    } finally {
      setLoading(false);
    }
  };

  const setInstanceActionLoading = (instanceId: string, action: string, isLoading: boolean) => {
    setActionLoading(prev => ({
      ...prev,
      [`${instanceId}-${action}`]: isLoading,
    }));
  };

  const handleStartInstance = async (id: string) => {
    setInstanceActionLoading(id, 'start', true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/aws-instance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: 'start', instanceId: id }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Server responded with status ${response.status}`);
      if (!data.success) throw new Error(data.error || 'Failed to start instance');
      await fetchInstances();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start instance');
    } finally {
      setInstanceActionLoading(id, 'start', false);
    }
  };

  const handleStopInstance = async (id: string) => {
    setInstanceActionLoading(id, 'stop', true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/aws-instance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: 'stop', instanceId: id }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Server responded with status ${response.status}`);
      if (!data.success) throw new Error(data.error || 'Failed to stop instance');
      await fetchInstances();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop instance');
    } finally {
      setInstanceActionLoading(id, 'stop', false);
    }
  };

  const handleTerminateInstance = async (id: string) => {
    if (!window.confirm('本当にこのインスタンスを終了しますか？データは完全に削除され、元に戻すことはできません。')) {
      return;
    }
    setInstanceActionLoading(id, 'terminate', true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/aws-instance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: 'terminate', instanceId: id }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Server responded with status ${response.status}`);
      if (!data.success) throw new Error(data.error || 'Failed to terminate instance');
      await fetchInstances();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to terminate instance');
    } finally {
      setInstanceActionLoading(id, 'terminate', false);
    }
  };

  const handleCreateInstance = async () => {
    setInstanceActionLoading('global', 'create', true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/aws-instance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: 'create' }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Server responded with status ${response.status}`);
      if (!data.success) throw new Error(data.error || 'Failed to create instance');
      await fetchInstances();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create instance');
    } finally {
      setInstanceActionLoading('global', 'create', false);
    }
  };

  const getStateVariant = (state: string): "default" | "secondary" | "destructive" | "outline" | null | undefined => {
    switch (state) {
      case 'running':
        return 'default';
      case 'stopped':
        return 'secondary';
      case 'pending':
      case 'stopping':
        return 'outline';
      default:
        return 'destructive';
    }
  }

  const isActionLoading = (instanceId: string, action: string): boolean => {
    return !!actionLoading[`${instanceId}-${action}`];
  }

  const isCreateLoading = actionLoading['global-create'];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <ArrowPathIcon className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-16 p-4 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-foreground">ダッシュボード</h1>
        
        <Card className="border-border mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <CardTitle className="text-foreground">AWS サーバー</CardTitle>
                <CardDescription className="text-muted-foreground">OpenHands インスタンスの管理</CardDescription>
              </div>
              <Button
                className="bg-primary hover:bg-primary/90 w-full md:w-auto"
                onClick={handleCreateInstance}
                disabled={isCreateLoading || Object.values(actionLoading).some(val => val)}
              >
                {isCreateLoading ? <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" /> : <PlayIcon className="w-5 h-5 mr-2" />}
                新規インスタンスを作成
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>エラー</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名前</TableHead>
                    <TableHead>タイプ</TableHead>
                    <TableHead>状態</TableHead>
                    <TableHead>IPアドレス</TableHead>
                    <TableHead>起動時間</TableHead>
                    <TableHead>アクセス</TableHead>
                    <TableHead className="text-right">アクション</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {instances.map((instance) => (
                    <TableRow key={instance.InstanceId}>
                      <TableCell className="font-medium">
                         {instance.Tags?.find(tag => tag.Key === 'Name')?.Value || instance.InstanceId}
                         <div className="text-xs text-muted-foreground">{instance.InstanceId}</div>
                      </TableCell>
                      <TableCell>{instance.InstanceType}</TableCell>
                      <TableCell>
                         <Badge variant={
                           instance.State.Name === 'running' ? 'default' :
                           instance.State.Name === 'stopped' ? 'secondary' :
                           'destructive'
                         }>
                           {instance.State.Name}
                         </Badge>
                      </TableCell>
                       <TableCell>{instance.PublicIpAddress || '-'}</TableCell>
                       <TableCell>
                        {instance.LaunchTime ? formatDistanceToNow(new Date(instance.LaunchTime), { addSuffix: true, locale: ja }) : '-'}
                      </TableCell>
                      <TableCell>
                        {instance.AccessUrl ? (
                          <a href={instance.AccessUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center">
                            <LinkIcon className="w-4 h-4 mr-1" />
                            開く
                          </a>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {instance.State.Name === 'stopped' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartInstance(instance.InstanceId)}
                             disabled={isActionLoading(instance.InstanceId, 'start') || isActionLoading(instance.InstanceId, 'stop') || isActionLoading(instance.InstanceId, 'terminate')}
                          >
                             {isActionLoading(instance.InstanceId, 'start') ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <PlayIcon className="w-4 h-4" />}
                          </Button>
                        )}
                        {instance.State.Name === 'running' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStopInstance(instance.InstanceId)}
                             disabled={isActionLoading(instance.InstanceId, 'start') || isActionLoading(instance.InstanceId, 'stop') || isActionLoading(instance.InstanceId, 'terminate')}
                          >
                            {isActionLoading(instance.InstanceId, 'stop') ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <StopIcon className="w-4 h-4" />}
                          </Button>
                        )}
                         {(instance.State.Name === 'running' || instance.State.Name === 'stopped') && (
                           <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleTerminateInstance(instance.InstanceId)}
                             disabled={isActionLoading(instance.InstanceId, 'start') || isActionLoading(instance.InstanceId, 'stop') || isActionLoading(instance.InstanceId, 'terminate')}
                          >
                             {isActionLoading(instance.InstanceId, 'terminate') ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <TrashIcon className="w-4 h-4" />}
                          </Button>
                         )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {instances.length === 0 && !loading && !error && (
              <div className="text-center py-8 text-gray-500">
                インスタンスがありません。新規インスタンスを作成してください。
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>環境変数・鍵の管理</CardTitle>
                <CardDescription>インスタンスの環境変数と鍵の設定</CardDescription>
              </div>
              <Button disabled>新しい設定を追加</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
                現在、この機能は準備中です。
             </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
