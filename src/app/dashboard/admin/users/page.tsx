'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldCheck, ShieldOff } from 'lucide-react';
import AdminCheck from '@/middleware/adminCheck';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_admin: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  // Fetch users and their admin status
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all users from the API route
        const response = await fetch('/api/admin/users');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch users');
        }
        const { users: allUsers } = await response.json();

        // Fetch the list of admin user IDs
        const { data: admins, error: adminsError } = await supabase
          .from('admin_users')
          .select('user_id');

        if (adminsError) throw adminsError;

        // Map admin status to each user
        const usersWithAdminFlag = allUsers.map((user: any) => ({
          ...user,
          is_admin: admins?.some(admin => admin.user_id === user.id) || false
        }));

        setUsers(usersWithAdminFlag);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast.error(error.message || "データの取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  // Function to toggle admin status
  const toggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    try {
      let currentUserId: string | undefined;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        currentUserId = user?.id;
      } catch (authError) {
        console.error("Auth error getting current user ID:", authError);
        toast.error("操作を実行できませんでした。再度ログインしてください。");
        return;
      }

      if (!currentUserId) {
         toast.error("操作を実行できませんでした。ログイン情報が見つかりません。");
         return;
      }

      if (currentIsAdmin) {
        // Prevent admin from removing themselves (optional, but recommended)
        if (userId === currentUserId) {
          toast.warning("自分自身の管理者権限は削除できません。");
          return;
        }
        // Remove admin role
        const { error } = await supabase
          .from('admin_users')
          .delete()
          .eq('user_id', userId);

        if (error) throw error;
        toast.success("管理者権限を削除しました。");
      } else {
        // Add admin role
        const { error } = await supabase
          .from('admin_users')
          .insert([
            { 
              user_id: userId,
              created_by: currentUserId // Record who made the change
            }
          ]);

        if (error) {
           // Handle potential unique constraint violation (already admin)
           if (error.code === '23505') { 
              toast.info("このユーザーは既に管理者です。");
           } else {
              throw error;
           }
        } else {
           toast.success("管理者権限を付与しました。");
        }
      }

      // Refresh user list to show the change
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, is_admin: !currentIsAdmin } : user
      );
      // Avoid updating if it was just an info toast (already admin)
      if (!(currentIsAdmin === false && error?.code === '23505')) {
          setUsers(updatedUsers);
      }

    } catch (error: any) {
      console.error('Error toggling admin status:', error);
      toast.error(error.message || "管理者権限の更新に失敗しました。");
    }
  };

  return (
    <AdminCheck>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">ユーザー一覧 (Admin)</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>登録ユーザー</CardTitle>
            <CardDescription>システムに登録されているユーザーの一覧です。</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">読み込み中...</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>メールアドレス</TableHead>
                      <TableHead>登録日時</TableHead>
                      <TableHead>最終ログイン</TableHead>
                      <TableHead>管理者</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleString('ja-JP')}</TableCell>
                        <TableCell>
                          {user.last_sign_in_at 
                            ? new Date(user.last_sign_in_at).toLocaleString('ja-JP')
                            : '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          {user.is_admin ? (
                            <ShieldCheck className="h-5 w-5 text-green-600 inline-block" />
                          ) : (
                            <ShieldOff className="h-5 w-5 text-muted-foreground inline-block" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant={user.is_admin ? "destructive" : "outline"}
                            size="sm"
                            onClick={() => toggleAdmin(user.id, user.is_admin)}
                            disabled={loading}
                          >
                            {user.is_admin ? "削除" : "管理者にする"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminCheck>
  );
} 