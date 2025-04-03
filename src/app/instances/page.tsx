'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';

interface Instance {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  type: string;
  created_at: string;
}

export default function InstancesPage() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchInstances = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('instances')
          .select('*')
          .eq('user_id', user.id);
        
        if (data) {
          setInstances(data);
        }
      }
    };
    
    fetchInstances();
  }, []);

  const handleStart = async (id: string) => {
    // TODO: インスタンス起動処理
    console.log('Starting instance:', id);
  };

  const handleStop = async (id: string) => {
    // TODO: インスタンス停止処理
    console.log('Stopping instance:', id);
  };

  const handleDelete = async (id: string) => {
    // TODO: インスタンス削除処理
    console.log('Deleting instance:', id);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">インスタンス</h1>
        <Button>新規インスタンスを作成</Button>
      </div>

      <div className="grid gap-6">
        {instances.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">インスタンスがありません</p>
              <Button className="mt-4">最初のインスタンスを作成</Button>
            </CardContent>
          </Card>
        ) : (
          instances.map((instance) => (
            <Card key={instance.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{instance.name}</CardTitle>
                    <CardDescription>Type: {instance.type}</CardDescription>
                  </div>
                  <div className={`px-2 py-1 rounded text-sm ${
                    instance.status === 'running' ? 'bg-green-100 text-green-800' :
                    instance.status === 'stopped' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {instance.status}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    作成日: {new Date(instance.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    {instance.status === 'stopped' ? (
                      <Button onClick={() => handleStart(instance.id)}>起動</Button>
                    ) : (
                      <Button onClick={() => handleStop(instance.id)}>停止</Button>
                    )}
                    <Button variant="outline" onClick={() => handleDelete(instance.id)}>
                      削除
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}