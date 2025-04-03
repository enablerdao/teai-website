'use client';

import { ThemeProvider } from '@/providers/theme-provider';
import { SessionProvider } from 'next-auth/react';

export function ProvidersWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={0}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
} 