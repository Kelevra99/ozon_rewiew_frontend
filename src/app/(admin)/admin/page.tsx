'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { toArray } from '@/lib/data';
import { Card } from '@/components/ui/card';
import { ErrorAlert } from '@/components/ui/error-alert';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';

export default function AdminHomePage() {
  const [stats, setStats] = useState({
    users: 0,
    reviews: 0,
    payments: 0,
    promptLogs: 0,
  });
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [users, reviews, payments, promptLogs] = await Promise.allSettled([
          apiFetch('/admin/users', { method: 'GET', auth: true }),
          apiFetch('/admin/reviews', { method: 'GET', auth: true }),
          apiFetch('/admin/payments', { method: 'GET', auth: true }),
          apiFetch('/admin/prompt-logs', { method: 'GET', auth: true }),
        ]);

        if (cancelled) return;

        setStats({
          users: users.status === 'fulfilled' ? toArray(users.value).length : 0,
          reviews: reviews.status === 'fulfilled' ? toArray(reviews.value).length : 0,
          payments: payments.status === 'fulfilled' ? toArray(payments.value).length : 0,
          promptLogs: promptLogs.status === 'fulfilled' ? toArray(promptLogs.value).length : 0,
        });
      } catch (error) {
        if (!cancelled) {
          setErrorText(error instanceof Error ? error.message : 'Не удалось загрузить admin dashboard');
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin dashboard"
        description="Все admin routes ходят по JWT и отдельно защищаются по role admin/superadmin."
      />

      {errorText ? <ErrorAlert text={errorText} /> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Пользователи" value={String(stats.users)} />
        <StatCard label="Генерации" value={String(stats.reviews)} />
        <StatCard label="Платежи" value={String(stats.payments)} />
        <StatCard label="Prompt logs" value={String(stats.promptLogs)} />
      </div>

      <Card>
        <div className="text-lg font-semibold text-white">Назначение разделов</div>
        <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">Users — просмотр пользователей и их данных.</div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">Reviews — генерации, статусы и детализация.</div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">Payments — платежи и их статусы.</div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">Rates / tiers / logs — управление настройками биллинга и аудитом.</div>
        </div>
      </Card>
    </div>
  );
}
