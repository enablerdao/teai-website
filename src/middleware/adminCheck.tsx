'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner'; // Using sonner based on previous logs
// import { isAdminEmail } from '@/lib/adminUtils'; // Remove this import

// const ADMIN_EMAIL = "yuki@hamada.tokyo"; // Remove this constant

export default function AdminCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      setIsChecking(true);
      try {
        // Check admin status using the RPC function
        const { data: isAdminData, error: rpcError } = await supabase.rpc('is_admin');

        if (rpcError) throw rpcError;

        if (isAdminData) {
          setIsAllowed(true);
        } else {
          setIsAllowed(false);
          toast.error("アクセス権限がありません", { description: "この画面は管理者のみアクセスできます。" });
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error checking admin status in middleware:', error);
        setIsAllowed(false);
        // Attempt to get user info for potential detailed error logging
        const { data: { user } } = await supabase.auth.getUser(); 
        console.error('Middleware check failed for user:', user?.email);
        toast.error("認証エラーが発生しました");
        router.push('/dashboard');
      } finally {
        setIsChecking(false);
      }
    };

    checkAdminStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, supabase]);

  if (isChecking) {
    return null; // Or a loading spinner
  }

  if (!isAllowed) {
     return null; // Prevent rendering children if not allowed (already redirecting)
  }

  return <>{children}</>;
} 