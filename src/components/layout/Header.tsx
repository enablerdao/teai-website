import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Rocket } from 'lucide-react';
import { Logo } from '@/components/Logo';
import UserNav from '@/components/layout/UserNav'; // Corrected path or assuming UserNav exists here
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';

const navLinks = [
  { href: '/docs', label: 'ドキュメント' },
  { href: '/pricing', label: '料金' }, // Example link
  { href: '/contact', label: 'お問い合わせ' },
];

export default function Header() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo />
            <span className="hidden font-bold sm:inline-block">Teai</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <Link href="/" className="flex items-center space-x-2 mb-4">
               <Logo />
               <span className="font-bold">Teai</span>
            </Link>
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {loading ? (
            <div className="h-8 w-20 animate-pulse bg-muted rounded-md"></div> // Placeholder while loading
          ) : session ? (
            <UserNav />
          ) : (
            <>
              <Button variant="ghost" asChild>
                 <Link href="/login">ログイン</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/login"> 
                  <Rocket className="mr-2 h-4 w-4" />
                  今すぐ無料でサーバーを立ち上げる
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
} 