'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { LoadingScreen } from '@/components/ui/loading-screen';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isReady, status } = useAuth();

  useEffect(() => {
    if (!isReady) return;
    if (status === 'guest') {
      router.replace('/login');
    }
  }, [isReady, status, router]);

  if (!isReady) return <LoadingScreen title="Проверяем авторизацию..." />;
  if (status !== 'authenticated') return <LoadingScreen title="Перенаправление..." />;

  return <>{children}</>;
}
