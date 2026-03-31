import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth/auth-provider';

export const metadata: Metadata = {
  metadataBase: new URL('https://kairox.su'),
  title: {
    default: 'KaiRox — AI-автоответы на отзывы маркетплейсов',
    template: '%s | KaiRox',
  },
  description:
    'KaiRox помогает продавцам на маркетплейсах отвечать на отзывы вручную, через расширение и в автоматическом режиме без дорогих подписок.',
  applicationName: 'KaiRox',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'KaiRox',
    title: 'KaiRox — AI-автоответы на отзывы маркетплейсов',
    description:
      'Живые ответы на отзывы, ручной режим, автоответы через расширение и API-режим для продавцов на маркетплейсах.',
    url: 'https://kairox.su',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
