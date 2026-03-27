'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { PaymentItem } from '@/types/api';
import { apiFetch } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorAlert } from '@/components/ui/error-alert';
import { PageHeader } from '@/components/ui/page-header';

export default function BillingTopupResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('paymentId');
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    if (!paymentId) {
      return;
    }

    let stopped = false;

    const sync = async () => {
      try {
        const payment = await apiFetch<PaymentItem>(`/payments/${paymentId}?refresh=1`, {
          method: 'GET',
          auth: true,
        });

        if (stopped) return;

        if (payment.status === 'paid') {
          router.replace(`/billing/topup/success?paymentId=${encodeURIComponent(paymentId)}`);
          return;
        }

        if (payment.status === 'failed' || payment.status === 'canceled') {
          router.replace(`/billing/topup/fail?paymentId=${encodeURIComponent(paymentId)}`);
        }
      } catch (error) {
        if (!stopped) {
          setErrorText(error instanceof Error ? error.message : 'Не удалось проверить статус платежа');
        }
      }
    };

    void sync();
    const interval = window.setInterval(() => {
      void sync();
    }, 3000);

    return () => {
      stopped = true;
      window.clearInterval(interval);
    };
  }, [paymentId, router]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Проверяем статус оплаты"
        description="Подождите несколько секунд. Как только Ozon Банк подтвердит результат, страница обновится автоматически."
      />

      {errorText ? <ErrorAlert text={errorText} /> : null}

      {!paymentId ? (
        <EmptyState title="Не найден идентификатор платежа" text="Вернитесь в раздел пополнения и создайте новый платёж." />
      ) : (
        <Card>
          <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 px-4 py-4 text-sm text-amber-100">
            Идёт проверка оплаты. Обычно это занимает несколько секунд.
          </div>
        </Card>
      )}
    </div>
  );
}
