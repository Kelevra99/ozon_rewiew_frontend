'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { canAccessAdmin } from '@/lib/navigation';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isReady, status, user } = useAuth();

  useEffect(() => {
    if (!isReady) return;
    if (status === 'guest') {
      router.replace('/login');
      return;
    }
    if (status === 'authenticated' && !canAccessAdmin(user?.role)) {
      router.replace('/dashboard');
    }
  }, [isReady, status, user?.role, router]);

  if (!isReady) return <LoadingScreen title="Проверяем права доступа..." />;
  if (status !== 'authenticated') return <LoadingScreen title="Перенаправление..." />;
  if (!canAccessAdmin(user?.role)) return <LoadingScreen title="Недостаточно прав..." />;

  return <>{children}</>;
}
