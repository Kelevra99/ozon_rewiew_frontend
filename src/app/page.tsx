'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { LoadingScreen } from '@/components/ui/loading-screen';

export default function HomePage() {
  const router = useRouter();
  const { isReady, status } = useAuth();

  useEffect(() => {
    if (!isReady) return;
    router.replace(status === 'authenticated' ? '/dashboard' : '/login');
  }, [isReady, status, router]);

  return <LoadingScreen title="Загружаем кабинет..." />;
}
