import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/navbar';
import { ProvidersWrapper } from './providers-wrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://teai.io'),
  title: {
    default: 'TeAI - AI開発者のためのクラウドプラットフォーム',
    template: '%s | TeAI',
  },
  description: 'TeAIは、AI開発者のためのクラウドプラットフォームです。',
  keywords: ['AI', 'クラウド', '開発', 'プラットフォーム', 'TeAI'],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning className="h-full">
      <body className={`${inter.className} min-h-full bg-background text-foreground antialiased`}>
        <ProvidersWrapper>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
        </ProvidersWrapper>
      </body>
    </html>
  );
}
