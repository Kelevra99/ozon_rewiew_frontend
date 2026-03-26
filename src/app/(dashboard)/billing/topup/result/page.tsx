'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { PaymentItem } from '@/types/api';
import { apiFetch } from '@/lib/api-client';
import { formatDateTime, formatRubles } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorAlert } from '@/components/ui/error-alert';
import { JsonBlock } from '@/components/ui/json-block';
import { PageHeader } from '@/components/ui/page-header';

export default function BillingTopupResultPage() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('paymentId') ?? '';
  const [payment, setPayment] = useState<PaymentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    if (!paymentId) {
      setLoading(false);
      setErrorText('Не передан paymentId в redirect URL.');
      return;
    }

    let cancelled = false;
    let intervalId: number | null = null;

    async function load() {
      try {
        const data = await apiFetch<PaymentItem>(`/payments/${paymentId}`, {
          method: 'GET',
          auth: true,
        });

        if (!cancelled) {
          setPayment(data);
          setErrorText('');
        }

        if (data.status === 'paid' || data.status === 'failed' || data.status === 'canceled') {
          if (intervalId != null) {
            window.clearInterval(intervalId);
            intervalId = null;
          }
        }
      } catch (error) {
        if (!cancelled) {
          setErrorText(error instanceof Error ? error.message : 'Не удалось загрузить статус платежа');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    intervalId = window.setInterval(() => {
      void load();
    }, 5000);

    return () => {
      cancelled = true;
      if (intervalId != null) {
        window.clearInterval(intervalId);
      }
    };
  }, [paymentId]);

  const statusText = useMemo(() => {
    switch (payment?.status) {
      case 'paid':
        return 'Платёж подтверждён. Баланс уже пополнен.';
      case 'failed':
        return 'Платёж отклонён.';
      case 'canceled':
        return 'Платёж отменён.';
      case 'pending':
      case 'created':
      default:
        return 'Ожидаем подтверждение от Ozon Bank. Начисление происходит только после webhook.';
    }
  }, [payment?.status]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Результат пополнения"
        description="Эта страница не начисляет деньги сама. Источник истины — webhook Ozon Acquiring."
        actions={
          <div className="flex gap-3">
            <Link href="/billing">
              <Button>Вернуться в кабинет</Button>
            </Link>
            <Link href="/billing/topup">
              <Button variant="secondary">Создать ещё одно пополнение</Button>
            </Link>
          </div>
        }
      />

      {errorText ? <ErrorAlert text={errorText} /> : null}

      <Card>
        <div className="space-y-3">
          <div className="text-xl font-semibold text-white">
            {loading ? 'Проверяем статус платежа...' : (payment?.status ?? 'Статус неизвестен')}
          </div>
          <div className="text-sm text-slate-300">{statusText}</div>
          {payment ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">Сумма</div>
                <div className="mt-2 text-base font-medium text-white">{formatRubles(payment.amountRub ?? 0)}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">ID платежа</div>
                <div className="mt-2 break-all text-sm font-medium text-white">{payment.id}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">Провайдер</div>
                <div className="mt-2 text-sm font-medium text-white">{payment.provider ?? 'ozon-bank'}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">Создан</div>
                <div className="mt-2 text-sm font-medium text-white">{formatDateTime(payment.createdAt)}</div>
              </div>
            </div>
          ) : null}
        </div>
      </Card>

      {payment ? (
        <Card>
          <JsonBlock title="Текущий ответ /v1/payments/:id" data={payment} />
        </Card>
      ) : null}
    </div>
  );
}
