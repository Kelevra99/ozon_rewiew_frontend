'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { PaymentItem } from '@/types/api';
import { apiFetch } from '@/lib/api-client';
import { toArray } from '@/lib/data';
import { formatDateTime, formatMinorToRub } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorAlert } from '@/components/ui/error-alert';
import { PageHeader } from '@/components/ui/page-header';

export default function PaymentsPage() {
  const [items, setItems] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  async function loadPayments() {
    setLoading(true);
    setErrorText('');

    try {
      const response = await apiFetch('/payments', {
        method: 'GET',
        auth: true,
      });
      setItems(toArray<PaymentItem>(response));
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось загрузить платежи');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPayments();
  }, []);

  const rows = items.map((item) => ({
    id: item.id,
    status: item.status ?? '—',
    provider: item.provider ?? '—',
    method: item.paymentMethod ?? '—',
    amount: typeof item.amountMinor === 'number' ? formatMinorToRub(item.amountMinor) : '—',
    providerPaymentId: item.providerPaymentId ?? '—',
    providerOrderId: item.providerOrderId ?? '—',
    createdAt: formatDateTime(item.createdAt),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Платежи"
        description="Список пополнений текущего пользователя через Ozon Acquiring SBP."
        actions={
          <div className="flex gap-3">
            <Link href="/billing/topup">
              <Button>Новое пополнение</Button>
            </Link>
            <Button variant="secondary" onClick={() => void loadPayments()}>
              Обновить
            </Button>
          </div>
        }
      />

      {errorText ? <ErrorAlert text={errorText} /> : null}

      {!loading && !rows.length ? (
        <EmptyState title="Платежей пока нет" text="Создай первое пополнение в разделе /billing/topup." />
      ) : null}

      {rows.length ? (
        <Card>
          <DataTable rows={rows} preferredColumns={['id', 'status', 'amount', 'method', 'providerPaymentId', 'providerOrderId', 'createdAt']} />
          <div className="mt-4 flex flex-wrap gap-3">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/billing/payments/${item.id}`}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
              >
                Открыть {item.id}
              </Link>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
