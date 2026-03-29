'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { PaymentItem } from '@/types/api';
import { apiFetch } from '@/lib/api-client';
import { toArray } from '@/lib/data';
import { formatDateTime, formatMinorToRub, formatRubles } from '@/lib/format';
import { Button, getButtonClassName } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorAlert } from '@/components/ui/error-alert';
import { PageHeader } from '@/components/ui/page-header';

function humanPaymentStatus(status?: string | null) {
  switch (status) {
    case 'paid':
      return 'Оплачен';
    case 'created':
    case 'pending':
      return 'Ожидает оплаты';
    case 'failed':
    case 'canceled':
      return 'Неуспешно';
    default:
      return '—';
  }
}

function statusClass(status?: string | null) {
  switch (status) {
    case 'paid':
      return 'border border-emerald-400/20 bg-emerald-500/10 text-emerald-200';
    case 'created':
    case 'pending':
      return 'border border-sky-400/20 bg-sky-500/10 text-sky-200';
    case 'failed':
    case 'canceled':
      return 'border border-rose-400/20 bg-rose-500/10 text-rose-200';
    default:
      return 'border border-white/10 bg-white/5 text-slate-300';
  }
}

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Платежи"
        description="История пополнений баланса и текущие статусы платежей."
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

      {!loading && !items.length ? (
        <EmptyState title="Платежей пока нет" text="Создайте первое пополнение в разделе «Пополнение баланса»." />
      ) : null}

      {(loading || items.length > 0) ? (
        <Card>
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-300">ID платежа</th>
                    <th className="px-4 py-3 font-medium text-slate-300">Статус</th>
                    <th className="px-4 py-3 font-medium text-slate-300">Сумма</th>
                    <th className="px-4 py-3 font-medium text-slate-300">Дата создания</th>
                    <th className="px-4 py-3 font-medium text-slate-300">Дата оплаты</th>
                    <th className="px-4 py-3 font-medium text-slate-300">Действие</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr className="border-t border-white/8">
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        Загружаем платежи...
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id} className="border-t border-white/8">
                        <td className="max-w-[220px] px-4 py-3 align-top text-xs text-slate-300">
                          <div className="break-all">{item.id}</div>
                        </td>

                        <td className="px-4 py-3 align-top">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusClass(item.status)}`}>
                            {humanPaymentStatus(item.status)}
                          </span>
                        </td>

                        <td className="px-4 py-3 align-top text-white">
                          {typeof item.amountRub === 'number'
                            ? formatRubles(item.amountRub)
                            : typeof item.amountMinor === 'number'
                              ? formatMinorToRub(item.amountMinor)
                              : '—'}
                        </td>

                        <td className="px-4 py-3 align-top text-white">
                          {formatDateTime(item.createdAt)}
                        </td>

                        <td className="px-4 py-3 align-top text-white">
                          {formatDateTime(item.paidAt)}
                        </td>

                        <td className="px-4 py-3 align-top">
                          <Link
                            href={`/billing/payments/${item.id}`}
                            className={getButtonClassName('primary', 'px-4 py-2')}
                          >
                            Открыть платёж
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
