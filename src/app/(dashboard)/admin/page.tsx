'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { toArray } from '@/lib/data';
import { formatDateTime, formatMinorToRub, formatRubles } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { ErrorAlert } from '@/components/ui/error-alert';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';

type Overview = {
  users?: unknown[];
  payments?: unknown[];
  reviews?: unknown[];
  promptLogs?: unknown[];
  auditLogs?: unknown[];
};

export default function AdminOverviewPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [errorText, setErrorText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setErrorText('');
        const [users, payments, reviews, promptLogs, auditLogs] = await Promise.all([
          apiFetch('/admin/users', { method: 'GET', auth: true }),
          apiFetch('/admin/payments', { method: 'GET', auth: true }),
          apiFetch('/admin/reviews', { method: 'GET', auth: true }),
          apiFetch('/admin/prompt-logs', { method: 'GET', auth: true }),
          apiFetch('/admin/audit-logs', { method: 'GET', auth: true }),
        ]);

        if (!cancelled) {
          setData({
            users: toArray(users),
            payments: toArray(payments),
            reviews: toArray(reviews),
            promptLogs: toArray(promptLogs),
            auditLogs: toArray(auditLogs),
          });
        }
      } catch (error) {
        if (!cancelled) {
          setErrorText(error instanceof Error ? error.message : 'Не удалось загрузить админ-панель');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <LoadingScreen title="Загружаем сводку..." />;

  const users = data?.users ?? [];
  const payments = data?.payments ?? [];
  const reviews = data?.reviews ?? [];
  const promptLogs = data?.promptLogs ?? [];
  const auditLogs = data?.auditLogs ?? [];

  const totalBalanceMinor = users.reduce((sum, item) => {
    if (item && typeof item === 'object' && typeof (item as Record<string, unknown>).balanceMinor === 'number') {
      return sum + ((item as Record<string, unknown>).balanceMinor as number);
    }
    return sum;
  }, 0);

  const recentUsers = users.slice(0, 5).map((item) => {
    const row = item as Record<string, unknown>;
    return {
      id: String(row.id ?? '—'),
      email: String(row.email ?? '—'),
      role: String(row.role ?? '—'),
      balance: typeof row.balanceMinor === 'number' ? formatMinorToRub(row.balanceMinor) : '—',
      createdAt: formatDateTime(row.createdAt),
    };
  });

  const recentPayments = payments.slice(0, 5).map((item) => {
    const row = item as Record<string, unknown>;
    return {
      id: String(row.id ?? '—'),
      user: String((row.user as Record<string, unknown> | undefined)?.email ?? '—'),
      status: String(row.status ?? '—'),
      amount: typeof row.amountMinor === 'number' ? formatMinorToRub(row.amountMinor) : '—',
      createdAt: formatDateTime(row.createdAt),
    };
  });

  const recentReviews = reviews.slice(0, 5).map((item) => {
    const row = item as Record<string, unknown>;
    return {
      id: String(row.id ?? '—'),
      user: String((row.user as Record<string, unknown> | undefined)?.email ?? '—'),
      rating: String(row.rating ?? '—'),
      status: String(row.status ?? '—'),
      createdAt: formatDateTime(row.createdAt),
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Админ-панель"
        description="Сводка по пользователям, платежам, отзывам, prompt logs и действиям администраторов."
        actions={
          <div className="flex gap-3">
            <Link href="/admin/users"><Button>Пользователи</Button></Link>
            <Link href="/admin/payments"><Button variant="secondary">Платежи</Button></Link>
          </div>
        }
      />

      {errorText ? <ErrorAlert text={errorText} /> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Пользователей" value={String(users.length)} />
        <StatCard label="Платежей" value={String(payments.length)} />
        <StatCard label="Отзывов" value={String(reviews.length)} />
        <StatCard label="Prompt logs" value={String(promptLogs.length)} />
        <StatCard label="Суммарный баланс" value={formatRubles(totalBalanceMinor / 100)} />
      </div>

      {recentUsers.length ? (
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="text-lg font-semibold text-white">Последние пользователи</div>
            <Link href="/admin/users" className="text-sm text-amber-300 hover:text-amber-200">Открыть всех</Link>
          </div>
          <DataTable rows={recentUsers} preferredColumns={['id', 'email', 'role', 'balance', 'createdAt']} />
        </Card>
      ) : null}

      {recentPayments.length ? (
        <Card>
          <div className="mb-4 text-lg font-semibold text-white">Последние платежи</div>
          <DataTable rows={recentPayments} preferredColumns={['id', 'user', 'status', 'amount', 'createdAt']} />
        </Card>
      ) : null}

      {recentReviews.length ? (
        <Card>
          <div className="mb-4 text-lg font-semibold text-white">Последние отзывы</div>
          <DataTable rows={recentReviews} preferredColumns={['id', 'user', 'rating', 'status', 'createdAt']} />
        </Card>
      ) : null}

      <Card>
        <div className="text-sm text-slate-400">
          Audit logs: {auditLogs.length}. Для детального просмотра используйте отдельный раздел журнала действий.
        </div>
      </Card>
    </div>
  );
}
