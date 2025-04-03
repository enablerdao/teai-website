'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CreditCardIcon,
  CloudIcon,
  ServerIcon,
  CogIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';

const navigation = [
  { name: 'インスタンス', href: '/instances', icon: ServerIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-card shadow-lg transition-all duration-300 ease-in-out"
      style={{ width: isExpanded ? '240px' : '64px' }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <nav className="flex flex-col h-full">
        <div className="flex-1 px-2 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <item.icon
                  className={`mr-3 flex-shrink-0 h-6 w-6 ${
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground group-hover:text-accent-foreground'
                  }`}
                  aria-hidden="true"
                />
                {isExpanded && item.name}
              </Link>
            );
          })}
        </div>
        <div className="p-2 border-t border-border">
          <div className="flex items-center justify-center">
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </div>
  );
}
