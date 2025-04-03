import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ProvidersWrapper>
          {children}
        </ProvidersWrapper>
      </body>
    </html>
  );
}
