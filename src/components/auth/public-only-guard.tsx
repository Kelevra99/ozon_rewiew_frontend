'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { LoadingScreen } from '@/components/ui/loading-screen';

export function PublicOnlyGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isReady, status } = useAuth();

  useEffect(() => {
    if (!isReady) return;
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [isReady, status, router]);

  if (!isReady) return <LoadingScreen title="Восстанавливаем сессию..." />;
  if (status === 'authenticated') return <LoadingScreen title="Перенаправление..." />;

  return <>{children}</>;
}
