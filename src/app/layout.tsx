import './globals.css';
import { AuthProvider } from '@/components/auth/auth-provider';

export const metadata = {
  title: 'OZON Auto Reply',
  description: 'Frontend cabinet for OZON Auto Reply backend',
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
