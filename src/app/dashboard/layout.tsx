'use client';

import { Sidebar } from '@/components/dashboard/Sidebar';
import { Sheet, SheetContent, SheetTrigger } from '../../components/ui/sheet';
import { Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User } from '@supabase/auth-helpers-nextjs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/Logo';

const CREDIT_RATE = 5; // 1円 = 5 Credit

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [creditBalanceYen, setCreditBalanceYen] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Reset to check via RPC
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchUserDataAndAdminStatus = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      setUser(user);

      if (authError) {
         console.error("Auth error:", authError);
         setIsAdmin(false);
         setCreditBalanceYen(null);
         return;
      }

      if (user) {
        // Fetch admin status using Supabase function
        try {
          const { data: isAdminData, error: rpcError } = await supabase.rpc('is_admin');
          if (rpcError) throw rpcError;
          setIsAdmin(!!isAdminData);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false); // Default to false on error
        }

        // Fetch credit balance
        try {
            const { data: creditData, error: creditError } = await supabase
            .from('user_credits')
            .select('balance')
            .eq('user_id', user.id)
            .single();
            if (creditError && creditError.code !== 'PGRST116') { // Ignore "No rows found" error
                 throw creditError;
            }
            setCreditBalanceYen(creditData?.balance ?? 0);
        } catch (error) {
            console.error("Error fetching credit balance:", error);
            setCreditBalanceYen(null);
        }
      } else {
        // Not logged in
        setIsAdmin(false);
        setCreditBalanceYen(null);
      }
    };
    fetchUserDataAndAdminStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Refetch user data and admin status on auth change
      fetchUserDataAndAdminStatus();
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const creditBalance = creditBalanceYen !== null ? creditBalanceYen * CREDIT_RATE : null;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center">
          {/* Left side: Logo */}
          <div className="flex items-center gap-2 px-4">
            <Link href="/dashboard" className="flex items-center" aria-label="Dashboard Home">
              <Logo />
            </Link>
          </div>

          {/* Right side: User Menu, Mobile Hamburger */}
          <div className="flex items-center gap-3 md:gap-4 ml-auto pr-4">
            {/* User Menu (Ensuring it renders only once) */}
            {user ? (
              <DropdownMenu key={user.id}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || 'User Avatar'} />
                      <AvatarFallback>{user.email?.[0].toUpperCase() ?? 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-xs leading-none text-muted-foreground">
                        残高: {creditBalance !== null ? creditBalance.toLocaleString() : '-'} Credit
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled>
                    <span className="truncate text-sm">{user.email}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    ログアウト
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                 <Button variant="outline" size="sm">ログイン</Button>
              </Link>
            )}

            {/* Mobile Hamburger Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[250px] p-0">
                <Sidebar isCollapsed={false} isAdmin={isAdmin} className="border-r-0" />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <div className={cn(
            "hidden md:block sticky top-16 h-[calc(100vh-4rem)] transition-all duration-300",
            isCollapsed ? "w-16" : "w-64"
        )}>
          <Sidebar isCollapsed={isCollapsed} isAdmin={isAdmin} setIsCollapsed={setIsCollapsed} className="h-full" />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
