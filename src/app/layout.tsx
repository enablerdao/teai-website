import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { ProvidersWrapper } from './providers-wrapper';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

const siteTitle = 'Te🖐️AI.io - 誰でも開発できるクラウドプラットフォーム';
const siteDescription = 'TeAI.io は、誰もが簡単にアプリケーションを開発し、デプロイできる直感的なクラウドプラットフォームです。';
const siteUrl = 'https://teai.io'; // Your production URL
const ogpImagePng = '/ogp-image-6.png';
const ogpImageSvg = '/ogp-image-6.svg';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: '%s | TeAI.io', // Updated site name
  },
  description: siteDescription,
  keywords: ['AI', 'クラウド', '開発', 'プラットフォーム', 'TeAI', 'ノーコード', 'ローコード', 'デプロイ'],
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: 'TeAI.io', // Updated site name
    images: [
      {
        url: ogpImagePng,
        width: 1200,
        height: 630,
        alt: 'TeAI.io OGP Image',
        type: 'image/png',
      },
      {
        url: ogpImageSvg,
        width: 1200,
        height: 630,
        alt: 'TeAI.io OGP Image (Vector)',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: [ogpImagePng, ogpImageSvg],
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
          <main className="min-h-screen">
            {children}
          </main>
        </ProvidersWrapper>
        <Toaster />
      </body>
    </html>
  );
}
