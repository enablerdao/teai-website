'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { PlayIcon, StopIcon, ArrowPathIcon, TrashIcon, LinkIcon, PencilSquareIcon, EllipsisVerticalIcon, ClockIcon, ServerIcon, GlobeAltIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"; // For Alert icon
import { formatDistanceToNow } from 'date-fns'; // For relative time
import { ja } from 'date-fns/locale'; // For Japanese locale
import { useRouter } from 'next/navigation';
import { Play, Square, Trash2, ExternalLink, MoreVertical, Edit, Cpu, Globe, Timer } from 'lucide-react';
import Image from 'next/image';

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

function InstanceActions({ instance, onAction }: { instance: Instance, onAction: (action: string, instanceId: string) => Promise<void> }) {
  const [isActionLoading, setIsActionLoading] = useState<Record<string, boolean>>({});
  const router = useRouter();

  const handleActionClick = async (action: string) => {
    setIsActionLoading(prev => ({ ...prev, [action]: true }));
    await onAction(action, instance.InstanceId);
    setIsActionLoading(prev => ({ ...prev, [action]: false }));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push(`/dashboard/instance/${instance.InstanceId}`)}>
          <ExternalLink className="w-4 h-4 mr-2" />
          詳細を表示
        </DropdownMenuItem>
        {instance.State === 'stopped' && (
          <DropdownMenuItem onClick={() => handleActionClick('start')} disabled={isActionLoading['start']}>
            <Play className="w-4 h-4 mr-2" />
            起動
          </DropdownMenuItem>
        )}
        {instance.State === 'running' && (
          <DropdownMenuItem onClick={() => handleActionClick('stop')} disabled={isActionLoading['stop']}>
            <Square className="w-4 h-4 mr-2" />
            停止
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => handleActionClick('terminate')} className="text-red-600 hover:!text-red-600 focus:text-red-600" disabled={isActionLoading['terminate']}>
          <Trash2 className="w-4 h-4 mr-2" />
          削除
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function formatInstanceName(name: string): string {
  if (!name) return '';
  const match = name.match(/teai-instance-[a-f0-9-]+-([a-z0-9]+)$/i);
  return match ? match[1].toUpperCase() : name;
}

export default function InstancesPage() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

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

  const handleAction = async (action: string, instanceId: string) => {
    setInstanceActionLoading(instanceId, action, true);
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
      await fetchInstances(); // Refresh list after action
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setInstanceActionLoading(instanceId, action, false);
    }
  };

  const isActionLoading = (instanceId: string, action: string): boolean => {
    return !!actionLoading[`${instanceId}-${action}`];
  }

  const isCreateLoading = actionLoading['global-create'];

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-none">
        <CardHeader className="px-0 pb-4">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">インスタンス管理</CardTitle>
              <CardDescription>OpenHands インスタンスの作成、起動、停止、削除を行います。</CardDescription>
            </div>
            <Button
              className="bg-primary hover:bg-primary/90 w-full md:w-auto"
              onClick={() => handleAction('create', '')}
              disabled={isCreateLoading || Object.values(actionLoading).some(val => val)}
            >
              {isCreateLoading ? <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" /> : <PlayIcon className="w-5 h-5 mr-2" />}
              新規インスタンスを作成
            </Button>
          </div>
        </CardHeader>
      </Card>

      {error && (
        <div className="p-4">
           <Alert variant="destructive">
             <Terminal className="h-4 w-4" />
             <AlertTitle>エラー</AlertTitle>
             <AlertDescription>{error}</AlertDescription>
           </Alert>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                 <div className="h-6 bg-muted rounded w-3/5"></div>
                 <div className="h-8 w-8 bg-muted rounded-md"></div>
              </CardHeader>
              <CardContent className="space-y-3">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardContent>
              <CardFooter className="pt-4">
                  <div className="h-9 bg-muted rounded w-full"></div>
              </CardFooter>
            </Card>
          ))
        ) : instances.length > 0 ? (
          instances.map((instance) => (
            <Card key={instance.InstanceId} className="group hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle 
                  className="text-lg font-medium truncate cursor-pointer group-hover:text-primary" 
                  title={instance.Name || instance.InstanceId}
                  onClick={() => router.push(`/dashboard/instance/${instance.InstanceId}`)}
                >
                  {formatInstanceName(instance.Name || instance.InstanceId)}
                </CardTitle>
                <InstanceActions instance={instance} onAction={handleAction} />
              </CardHeader>
              <CardContent 
                className="space-y-3 cursor-pointer" 
                onClick={() => router.push(`/dashboard/instance/${instance.InstanceId}`)}
              >
                <div className="flex items-center text-sm text-muted-foreground">
                  <InformationCircleIcon className="w-4 h-4 mr-1.5" />
                  ID: <span className="ml-1 font-mono text-xs">{instance.InstanceId}</span>
                </div>
                 <div className="flex items-center text-sm">
                    <Cpu className="w-4 h-4 mr-1.5 text-muted-foreground" />
                    Type: <span className="ml-1 font-medium">{instance.InstanceType}</span>
                 </div>
                <div className="flex items-center text-sm text-muted-foreground">
                   <Globe className="w-4 h-4 mr-1.5" />
                   Domain: <span className="ml-1 font-mono text-xs truncate" title={instance.Domain}>{instance.Domain || 'N/A'}</span>
                </div>
                 <div className="flex items-center text-sm text-muted-foreground">
                    <span className="w-4 h-4 mr-1.5"></span>
                     IP: <span className="ml-1 font-mono text-xs">{instance.PublicIpAddress || '-'}</span>
                 </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Timer className="w-4 h-4 mr-1.5" />
                  Launched: {instance.LaunchTime ? formatDistanceToNow(new Date(instance.LaunchTime), { addSuffix: true, locale: ja }) : 'N/A'}
                </div>
              </CardContent>
              <CardFooter className="pt-4 flex items-center justify-between">
                  <InstanceStatus state={instance.State} />
                   {instance.PublicIpAddress && instance.State === 'running' ? (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`https://${instance.Domain}:3000`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
                           <Image src="/images/openhands-logo.png" alt="OpenHands" width={16} height={16} className="mr-2" />
                           OpenHandsを開く
                        </a>
                      </Button>
                    ) : (
                        <Button variant="outline" size="sm" disabled>
                            OpenHandsを開く
                        </Button>
                    )}
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-1 lg:col-span-2 xl:col-span-3 text-center py-16 text-muted-foreground">
            <p className="mb-2">インスタンスがありません。</p>
            <Button onClick={() => handleAction('create', '')} disabled={isCreateLoading}>
               最初のインスタンスを作成
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 