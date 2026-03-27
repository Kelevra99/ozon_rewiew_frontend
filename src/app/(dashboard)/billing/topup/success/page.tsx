'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { PaymentItem } from '@/types/api';
import { apiFetch } from '@/lib/api-client';
import { PaymentStatusPanel } from '@/components/billing/payment-status-panel';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorAlert } from '@/components/ui/error-alert';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { PageHeader } from '@/components/ui/page-header';

export default function BillingTopupSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('paymentId');
  const [payment, setPayment] = useState<PaymentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    if (!paymentId) {
      setLoading(false);
      return;
    }

    let stopped = false;

    const load = async () => {
      try {
        setLoading(true);
        const next = await apiFetch<PaymentItem>(`/payments/${paymentId}?refresh=1`, {
          method: 'GET',
          auth: true,
        });

        if (stopped) return;

        if (next.status === 'failed' || next.status === 'canceled') {
          router.replace(`/billing/topup/fail?paymentId=${encodeURIComponent(paymentId)}`);
          return;
        }

        setPayment(next);
      } catch (error) {
        if (!stopped) {
          setErrorText(error instanceof Error ? error.message : 'Не удалось загрузить платёж');
        }
      } finally {
        if (!stopped) {
          setLoading(false);
        }
      }
    };

    void load();
  }, [paymentId, router]);

  if (loading) {
    return <LoadingScreen title="Загружаем статус оплаты..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Успешное пополнение"
        description="Страница подтверждения после успешной оплаты через Ozon Банк."
      />

      {errorText ? <ErrorAlert text={errorText} /> : null}

      {!paymentId ? (
        <EmptyState title="Не найден идентификатор платежа" />
      ) : payment ? (
        <PaymentStatusPanel payment={payment} />
      ) : (
        <EmptyState title="Платёж не найден" />
      )}
    </div>
  );
}
