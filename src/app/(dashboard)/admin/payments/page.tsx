'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { toArray } from '@/lib/data';
import { formatDateTime, formatMinorToRub } from '@/lib/format';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { ErrorAlert } from '@/components/ui/error-alert';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { PageHeader } from '@/components/ui/page-header';

export default function AdminPaymentsPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const response = await apiFetch('/admin/payments', { method: 'GET', auth: true });
        if (!cancelled) setRows(toArray<Record<string, unknown>>(response));
      } catch (error) {
        if (!cancelled) setErrorText(error instanceof Error ? error.message : 'Не удалось загрузить платежи');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <LoadingScreen title="Загружаем платежи..." />;

  const tableRows = rows.map((row) => ({
    id: String(row.id ?? '—'),
    user: String((row.user as Record<string, unknown> | undefined)?.email ?? '—'),
    status: String(row.status ?? '—'),
    amount: typeof row.amountMinor === 'number' ? formatMinorToRub(row.amountMinor) : '—',
    providerOrderId: String(row.providerOrderId ?? '—'),
    createdAt: formatDateTime(row.createdAt),
    paidAt: formatDateTime(row.paidAt),
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Платежи" description="Все пополнения баланса через платёжный модуль." />
      {errorText ? <ErrorAlert text={errorText} /> : null}
      <Card>
        <DataTable rows={tableRows} preferredColumns={['id', 'user', 'status', 'amount', 'providerOrderId', 'createdAt', 'paidAt']} />
        <div className="mt-4 flex flex-wrap gap-3">
          {rows.map((row) => (
            <Link key={String(row.id)} href={`/admin/payments/${String(row.id)}`} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10">
              Открыть платёж {String(row.id ?? '')}
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
