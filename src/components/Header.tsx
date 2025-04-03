'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const Logo = () => (
    <svg className="h-10 w-auto" viewBox="0 0 250 120" xmlns="http://www.w3.org/2000/svg">
      <style>
        {`
          @keyframes drawStroke {
            0% {
              stroke-dasharray: 300;
              stroke-dashoffset: 300;
            }
            100% {
              stroke-dasharray: 300;
              stroke-dashoffset: 0;
            }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .te-stroke {
            animation: drawStroke 1.5s ease-out forwards;
          }
          .text-fade {
            opacity: 0;
            animation: fadeIn 0.5s ease-out forwards;
            animation-delay: 1s;
          }
        `}
      </style>
      <path
        d="M20 60 C40 50, 60 50, 70 60 C80 70, 70 80, 50 85 C40 87, 30 90, 35 100 C40 110, 60 105, 90 95"
        stroke="#00CC99"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="te-stroke"
      />
      <defs>
        <linearGradient id="greenBlueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00CC99">
            <animate attributeName="stop-color" values="#00CC99;#00E6B0;#00CC99" dur="4s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor="#3498DB">
            <animate attributeName="stop-color" values="#3498DB;#4AA3E5;#3498DB" dur="4s" repeatCount="indefinite" />
          </stop>
        </linearGradient>
      </defs>
      <text x="100" y="80" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="42" fill="url(#greenBlueGradient)" className="text-fade">
        TeAI
      </text>
      <text x="190" y="80" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="42" fill="#95A5A6" className="text-fade dark:fill-gray-400">
        .io
      </text>
    </svg>
  );

  const MobileLogo = () => (
    <svg className="h-8 w-auto" viewBox="0 0 250 120" xmlns="http://www.w3.org/2000/svg">
      <style>{`@keyframes fadeIn {from { opacity: 0; } to { opacity: 1; }}`}</style>
      <defs><linearGradient id="gBG" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#00CC99" /><stop offset="100%" stopColor="#3498DB" /></linearGradient></defs>
      <text x="100" y="80" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="42" fill="url(#gBG)" style={{animation: 'fadeIn 1s ease-out forwards'}}>TeAI</text>
      <text x="190" y="80" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="42" fill="#95A5A6" style={{animation: 'fadeIn 1s ease-out forwards'}} className="dark:fill-gray-400">.io</text>
    </svg>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            {mounted && <Logo />}
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/docs" className="transition-colors hover:text-foreground/80">
              ドキュメント
            </Link>
            <Link href="/tutorial" className="transition-colors hover:text-foreground/80">
              チュートリアル
            </Link>
            <Link href="/status" className="transition-colors hover:text-foreground/80">
              ステータス
            </Link>
          </nav>
        </div>
        <div className="hidden flex-1 items-center justify-end space-x-4 md:flex">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:text-foreground/80"
          >
            {mounted && (theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            ))}
          </button>
          <Link
            href="/login"
            className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:text-foreground/80"
          >
            ログイン
          </Link>
          <Link
            href="/register"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            新規登録
          </Link>
        </div>
        <div className="flex items-center md:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-foreground"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">メニューを開く</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </div>
      <div className={`relative z-50 md:hidden ${mobileMenuOpen ? '' : 'hidden'}`} role="dialog" aria-modal="true">
        <div className="fixed inset-0 bg-black/30" onClick={() => setMobileMenuOpen(false)} />
        <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5" onClick={() => setMobileMenuOpen(false)}>
              <span className="sr-only">TeAI.io</span>
              {mounted && <MobileLogo />}
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">メニューを閉じる</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10 dark:divide-gray-700">
              <div className="space-y-2 py-6">
                <Link
                  href="/docs"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ドキュメント
                </Link>
                <Link
                  href="/tutorial"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  チュートリアル
                </Link>
                <Link
                  href="/status"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ステータス
                </Link>
              </div>
              <div className="py-6">
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-foreground hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {mounted && (theme === 'dark' ? 'ライトモード' : 'ダークモード')}
                </button>
                <Link
                  href="/login"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-foreground hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ログイン
                </Link>
                <Link
                  href="/register"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-foreground hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  新規登録
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 