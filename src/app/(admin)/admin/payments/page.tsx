'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { AdminPaymentListItem } from '@/types/api';
import { apiFetch } from '@/lib/api-client';
import { formatDateTime, formatMinorToRub } from '@/lib/format';
import { Button, getButtonClassName } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorAlert } from '@/components/ui/error-alert';
import { PageHeader } from '@/components/ui/page-header';

export default function AdminPaymentsPage() {
  const [items, setItems] = useState<AdminPaymentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  async function load() {
    setLoading(true);
    setErrorText('');

    try {
      const result = await apiFetch<AdminPaymentListItem[]>('/admin/payments', {
        method: 'GET',
        auth: true,
      });
      setItems(Array.isArray(result) ? result : []);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось загрузить список платежей');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Платежи"
        description="Все платежи по системе со статусами, суммами и пользователями."
        actions={<Button variant="secondary" onClick={() => void load()}>Обновить</Button>}
      />

      {errorText ? <ErrorAlert text={errorText} /> : null}

      {!loading && !items.length ? <EmptyState title="Платежей пока нет" /> : null}

      <Card>
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-300">Создан</th>
                  <th className="px-4 py-3 font-medium text-slate-300">Оплачен</th>
                  <th className="px-4 py-3 font-medium text-slate-300">Пользователь</th>
                  <th className="px-4 py-3 font-medium text-slate-300">Статус</th>
                  <th className="px-4 py-3 font-medium text-slate-300">Провайдер</th>
                  <th className="px-4 py-3 font-medium text-slate-300">Сумма</th>
                  <th className="px-4 py-3 font-medium text-slate-300">Order ID</th>
                  <th className="px-4 py-3 font-medium text-slate-300">Действие</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr className="border-t border-white/8">
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                      Загружаем платежи...
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="border-t border-white/8">
                      <td className="px-4 py-3 align-top text-white">{formatDateTime(item.createdAt)}</td>
                      <td className="px-4 py-3 align-top text-white">{formatDateTime(item.paidAt ?? null)}</td>
                      <td className="px-4 py-3 align-top text-white">{item.user?.email || item.user?.name || '—'}</td>
                      <td className="px-4 py-3 align-top text-white">{item.status || '—'}</td>
                      <td className="px-4 py-3 align-top text-white">{item.provider || '—'}</td>
                      <td className="px-4 py-3 align-top text-white">{formatMinorToRub(item.amountMinor)}</td>
                      <td className="max-w-[220px] px-4 py-3 align-top text-white">
                        <div className="break-all">{item.providerOrderId || '—'}</div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <Link href={`/admin/payments/${item.id}`} className={getButtonClassName('primary', 'px-4 py-2')}>
                          Открыть
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
    </div>
  );
}
