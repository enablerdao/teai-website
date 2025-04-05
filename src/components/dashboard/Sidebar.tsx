'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  ServerIcon,
  KeyIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  UsersIcon,
  ListBulletIcon,
  CurrencyDollarIcon,
  ChevronRightIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Logo } from "@/components/Logo";

const userNavigation = [
  { name: 'ダッシュボード', href: '/dashboard', icon: HomeIcon },
  { name: 'インスタンス', href: '/dashboard/instances', icon: ServerIcon },
  { name: '環境変数・鍵', href: '/dashboard/api-keys', icon: KeyIcon },
  { name: '課金情報', href: '/dashboard/billing', icon: CreditCardIcon },
  { name: '設定', href: '/dashboard/settings', icon: Cog6ToothIcon },
];

const adminNavigation = [
  { name: 'ユーザー一覧', href: '/dashboard/admin/users', icon: UsersIcon },
  { name: 'インスタンス一覧', href: '/dashboard/admin/instances', icon: ListBulletIcon },
  { name: 'ポイント管理', href: '/dashboard/admin/credits', icon: CurrencyDollarIcon },
];

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed: boolean;
  isAdmin: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
}

export function Sidebar({ className, isCollapsed, isAdmin, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();

  const renderNavItems = (items: typeof userNavigation) => {
    return items.map((item) => {
      if (!item.icon) return null;
      const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
      return (
        <Link
          key={item.name}
          href={item.href}
          title={isCollapsed ? item.name : undefined}
          className={cn(
            "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
            isActive
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            isCollapsed ? 'justify-center' : ''
          )}
        >
          <item.icon
            className={cn(
              "flex-shrink-0 h-5 w-5",
              isActive
                ? 'text-primary'
                : 'text-muted-foreground group-hover:text-accent-foreground',
              isCollapsed ? '' : 'mr-3'
            )}
            aria-hidden="true"
          />
          {!isCollapsed && <span className="truncate">{item.name}</span>}
        </Link>
      );
    });
  }

  return (
    <div className={cn("flex flex-col h-full bg-background border-r transition-all duration-300", isCollapsed ? 'w-16' : 'w-64', className)}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-end p-4">
          {setIsCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />}
            </Button>
          )}
        </div>
        <nav className="flex-1 flex flex-col px-2 py-4 space-y-1 overflow-y-auto">
          {renderNavItems(userNavigation)}

          {isAdmin && (
            <>
              <div className="px-2 pt-4 pb-1">
                <span className={cn(
                    "text-xs font-semibold uppercase text-muted-foreground",
                    isCollapsed && "hidden"
                  )}>
                  Admin
                </span>
              </div>
              {renderNavItems(adminNavigation)}
            </>
          )}
        </nav>
        
        <div className={cn("p-2 border-t border-border mt-auto", isCollapsed ? 'flex justify-center' : 'px-4')}>
           <div className={cn("flex items-center", isCollapsed ? 'justify-center' : 'justify-between w-full')}>
              {/* Temporarily removed ThemeToggle */}
           </div>
        </div>
      </div>
    </div>
  );
}
