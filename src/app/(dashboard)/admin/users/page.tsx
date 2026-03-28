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

export default function AdminUsersPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setErrorText('');
        const response = await apiFetch('/admin/users', { method: 'GET', auth: true });
        if (!cancelled) setRows(toArray<Record<string, unknown>>(response));
      } catch (error) {
        if (!cancelled) setErrorText(error instanceof Error ? error.message : 'Не удалось загрузить пользователей');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <LoadingScreen title="Загружаем пользователей..." />;

  const tableRows = rows.map((row) => ({
    id: String(row.id ?? '—'),
    email: String(row.email ?? '—'),
    name: String(row.name ?? '—'),
    role: String(row.role ?? '—'),
    isActive: String(row.isActive ?? '—'),
    balance: typeof row.balanceMinor === 'number' ? formatMinorToRub(row.balanceMinor) : '—',
    productsCount: String(row.productsCount ?? '0'),
    reviewsCount: String(row.reviewsCount ?? '0'),
    paymentsCount: String(row.paymentsCount ?? '0'),
    lastLoginAt: formatDateTime(row.lastLoginAt),
    createdAt: formatDateTime(row.createdAt),
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Пользователи" description="Все пользователи сервиса с балансом, ролью и краткой активностью." />
      {errorText ? <ErrorAlert text={errorText} /> : null}
      <Card>
        <DataTable rows={tableRows} preferredColumns={['id', 'email', 'role', 'isActive', 'balance', 'productsCount', 'reviewsCount', 'paymentsCount', 'createdAt']} />
        <div className="mt-4 flex flex-wrap gap-3">
          {rows.map((row) => (
            <Link key={String(row.id)} href={`/admin/users/${String(row.id)}`} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10">
              Открыть {String(row.email ?? row.id ?? 'пользователя')}
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
