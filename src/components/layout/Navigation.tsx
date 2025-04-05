'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  CreditCard,
  Key,
  Settings,
  Shield,
} from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: isAdmin, error } = await supabase
          .rpc('is_admin');

        if (error) throw error;
        setIsAdmin(!!isAdmin);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [supabase]);

  return (
    <div className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2">
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        <Link href="/dashboard" passHref>
          <Button
            variant={pathname === '/dashboard' ? 'default' : 'ghost'}
            className={cn(
              'w-full justify-start',
              pathname === '/dashboard' && 'bg-primary/10 hover:bg-primary/20'
            )}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            ダッシュボード
          </Button>
        </Link>
        <Link href="/dashboard/billing" passHref>
          <Button
            variant={pathname === '/dashboard/billing' ? 'default' : 'ghost'}
            className={cn(
              'w-full justify-start',
              pathname === '/dashboard/billing' && 'bg-primary/10 hover:bg-primary/20'
            )}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            課金情報
          </Button>
        </Link>
        <Link href="/dashboard/api-keys" passHref>
          <Button
            variant={pathname === '/dashboard/api-keys' ? 'default' : 'ghost'}
            className={cn(
              'w-full justify-start',
              pathname === '/dashboard/api-keys' && 'bg-primary/10 hover:bg-primary/20'
            )}
          >
            <Key className="mr-2 h-4 w-4" />
            APIキー
          </Button>
        </Link>
        <Link href="/dashboard/settings" passHref>
          <Button
            variant={pathname === '/dashboard/settings' ? 'default' : 'ghost'}
            className={cn(
              'w-full justify-start',
              pathname === '/dashboard/settings' && 'bg-primary/10 hover:bg-primary/20'
            )}
          >
            <Settings className="mr-2 h-4 w-4" />
            設定
          </Button>
        </Link>
        {isAdmin && (
          <Link href="/dashboard/admin" passHref>
            <Button
              variant={pathname === '/dashboard/admin' ? 'default' : 'ghost'}
              className={cn(
                'w-full justify-start',
                pathname === '/dashboard/admin' && 'bg-primary/10 hover:bg-primary/20'
              )}
            >
              <Shield className="mr-2 h-4 w-4" />
              管理者画面
            </Button>
          </Link>
        )}
      </nav>
    </div>
  );
} 