'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, KeyIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
// import { useSidebarStore } from '@/stores/sidebarStore'; // Temporarily commented out
// import { useUserCredits } from '@/hooks/useUserCredits'; // Temporarily commented out
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { ArrowLeftToLine, ArrowRightToLine, Settings, Server, Home, Key, LayoutDashboard, CreditCard } from 'lucide-react';
import { Logo } from '@/components/Logo';

export function Sidebar() {
  const pathname = usePathname();
  // const { isCollapsed, toggleSidebar } = useSidebarStore(); // Temporarily commented out
  const isCollapsed = false; // Temporary value
  const toggleSidebar = () => {}; // Temporary function
  // const { data: userCredits } = useUserCredits(); // Temporarily commented out
  const userCredits = { balance: 0 }; // Temporary value

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'ダッシュボード' },
    { href: '/dashboard/instances', icon: Server, label: 'インスタンス' },
    { href: '/dashboard/billing', icon: CreditCard, label: '課金情報' },
    { href: '/dashboard/api-keys', icon: Key, label: 'APIキー' },
    { href: '/dashboard/settings', icon: Settings, label: '設定' },
  ];

  return (
    <aside className={`fixed top-0 left-0 z-40 h-screen border-r bg-background transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex h-full flex-col justify-between py-4">
        <div>
          <div className={`flex items-center px-4 mb-6 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isCollapsed && (
              <Link href="/dashboard" className="flex items-center gap-2">
                <Logo />
              </Link>
            )}
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className={isCollapsed ? 'mx-auto' : ''}>
              {isCollapsed ? <ArrowRightToLine className="h-5 w-5" /> : <ArrowLeftToLine className="h-5 w-5" />}
            </Button>
          </div>
          <nav className="px-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${pathname === item.href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'}`}
              >
                <item.icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>
        <div className="px-2 space-y-2">
          <Separator />
          <div className={`p-2 text-sm ${isCollapsed ? 'text-center' : ''}`}>
            <div className={`font-semibold ${isCollapsed ? 'hidden' : ''}`}>クレジット残高</div>
            <div className={`text-lg font-bold ${isCollapsed ? 'text-center text-xs mt-1' : 'mt-1'}`}>
              {userCredits ? `${userCredits.balance.toLocaleString()} 円` : <Loader2 className="h-4 w-4 animate-spin inline-block" />}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}