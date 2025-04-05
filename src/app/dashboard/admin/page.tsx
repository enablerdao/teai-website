'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import AdminCheck from '@/middleware/adminCheck';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Users, CreditCard, Activity, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasNoAdmins, setHasNoAdmins] = useState(false);
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  // ユーザー一覧と管理者一覧を取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 全ユーザー取得
        const response = await fetch('/api/admin/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const { users: allUsers } = await response.json();

        // 管理者一覧取得
        const { data: admins, error: adminsError } = await supabase
          .from('admin_users')
          .select(`
            *,
            users:user_id (
              email
            ),
            creator:created_by (
              email
            )
          `);

        if (adminsError) throw adminsError;

        setUsers(allUsers || []);
        setAdminUsers(admins || []);
        setHasNoAdmins((admins || []).length === 0);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          variant: "destructive",
          title: "エラー",
          description: "データの取得に失敗しました。",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase, toast]);

  // 新しい管理者を追加
  const addAdmin = async () => {
    try {
      // メールアドレスからユーザーIDを取得
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', newAdminEmail)
        .single();

      if (userError) throw userError;
      if (!userData) throw new Error('ユーザーが見つかりません');

      // 管理者として追加
      const { error: insertError } = await supabase
        .from('admin_users')
        .insert([
          { 
            user_id: userData.id,
            created_by: (await supabase.auth.getUser()).data.user?.id
          }
        ]);

      if (insertError) throw insertError;

      toast({
        title: "管理者を追加しました",
        description: `${newAdminEmail}を管理者として登録しました。`,
      });

      // 管理者一覧を更新
      const { data: admins } = await supabase
        .from('admin_users')
        .select(`
          *,
          users:user_id (
            email
          ),
          creator:created_by (
            email
          )
        `);

      setAdminUsers(admins || []);
      setHasNoAdmins((admins || []).length === 0);
      setNewAdminEmail('');
    } catch (error: any) {
      console.error('Error adding admin:', error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: error.message || "管理者の追加に失敗しました。",
      });
    }
  };

  // 自分を特権管理者として追加
  const addSelfAsAdmin = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('ユーザー情報の取得に失敗しました');

      // 管理者として追加
      const { error: insertError } = await supabase
        .from('admin_users')
        .insert([
          { 
            user_id: user.id,
            created_by: user.id
          }
        ]);

      if (insertError) throw insertError;

      toast({
        title: "特権管理者として登録しました",
        description: "あなたが最初の管理者として登録されました。",
      });

      // 管理者一覧を更新
      const { data: admins } = await supabase
        .from('admin_users')
        .select(`
          *,
          users:user_id (
            email
          ),
          creator:created_by (
            email
          )
        `);

      setAdminUsers(admins || []);
      setHasNoAdmins((admins || []).length === 0);
    } catch (error: any) {
      console.error('Error adding self as admin:', error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: error.message || "管理者の登録に失敗しました。",
      });
    }
  };

  // 管理者がいない場合は、誰でも管理者になれる画面を表示
  if (hasNoAdmins) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              管理者が設定されていません
            </CardTitle>
            <CardDescription>
              現在、システムに管理者が一人も設定されていません。
              最初の管理者として自分を登録できます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                最初の管理者は特権管理者として登録され、他の管理者を管理できるようになります。
              </AlertDescription>
            </Alert>
            <Button onClick={addSelfAsAdmin} className="w-full">
              特権管理者として登録する
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AdminCheck>
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8">管理者ダッシュボード</h1>
        
        <Tabs defaultValue="admins" className="space-y-4">
          <TabsList>
            <TabsTrigger value="admins" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              管理者一覧
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              ユーザー統計
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              課金情報
            </TabsTrigger>
          </TabsList>

          <TabsContent value="admins" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>新しい管理者を追加</CardTitle>
                <CardDescription>
                  既存のユーザーを管理者として追加します。
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Input
                  type="email"
                  placeholder="メールアドレス"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                />
                <Button onClick={addAdmin} className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  追加
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>管理者一覧</CardTitle>
                <CardDescription>
                  現在の管理者一覧です。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">メールアドレス</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">追加日時</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">追加者</th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-gray-200">
                      {adminUsers.map((admin) => (
                        <tr key={admin.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {admin.users?.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {new Date(admin.created_at).toLocaleString('ja-JP')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {admin.creator?.email}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ユーザー統計</CardTitle>
                <CardDescription>
                  ユーザーの利用状況を確認できます。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        総ユーザー数
                      </CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{users.length}</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6">
                  <div className="rounded-md border">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">メールアドレス</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">登録日時</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">最終ログイン</th>
                        </tr>
                      </thead>
                      <tbody className="bg-background divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {new Date(user.created_at).toLocaleString('ja-JP')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('ja-JP') : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>課金情報</CardTitle>
                <CardDescription>
                  ユーザーの課金状況を確認できます。
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* 課金情報の詳細を実装予定 */}
                <p className="text-muted-foreground">実装中...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminCheck>
  );
} 