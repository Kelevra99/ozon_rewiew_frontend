'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { AdminDashboardSummaryResponse } from '@/types/api';
import { apiFetch } from '@/lib/api-client';
import { formatRubles } from '@/lib/format';
import { AdminFinanceChart } from '@/components/admin/admin-finance-chart';
import { Card } from '@/components/ui/card';
import { ErrorAlert } from '@/components/ui/error-alert';
import { PageHeader } from '@/components/ui/page-header';

export default function AdminHomePage() {
  const [period, setPeriod] = useState<7 | 30 | 90>(30);
  const [data, setData] = useState<AdminDashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setErrorText('');

        const result = await apiFetch<AdminDashboardSummaryResponse>(`/admin/dashboard/summary?days=${period}`, {
          method: 'GET',
          auth: true,
        });

        if (!cancelled) {
          setData(result);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorText(error instanceof Error ? error.message : 'Не удалось загрузить admin dashboard');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [period]);

  const counts = data?.counts ?? { users: 0, reviews: 0, payments: 0, promptLogs: 0 };
  const today = data?.today ?? {
    date: new Date().toISOString().slice(0, 10),
    topupRub: 0,
    chargedRub: 0,
    openAiCostRub: 0,
    grossProfitRub: 0,
    repliesCount: 0,
    paidPaymentsCount: 0,
    promptLogsCount: 0,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin dashboard"
        description="Главная сводка по системе: пользователи, генерации, платежи, prompt logs и финансовая динамика по дням."
      />

      {errorText ? <ErrorAlert text={errorText} /> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardLinkCard href="/admin/users" label="Пользователи" value={String(counts.users)} hint="Открыть полный список пользователей" />
        <DashboardLinkCard href="/admin/reviews" label="Генерации" value={String(counts.reviews)} hint="Открыть все генерации" />
        <DashboardLinkCard href="/admin/payments" label="Платежи" value={String(counts.payments)} hint="Открыть все платежи" />
        <DashboardLinkCard href="/admin/prompt-logs" label="Prompt logs" value={String(counts.promptLogs)} hint="Открыть все prompt logs" />
      </div>

      <Card>
        <div className="mb-4 text-lg font-semibold text-white">Финансы сегодня</div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FinanceCard label="Пополнения за день" value={formatRubles(today.topupRub)} />
          <FinanceCard label="Выручка за день" value={formatRubles(today.chargedRub)} />
          <FinanceCard label="Себестоимость OpenAI" value={formatRubles(today.openAiCostRub)} />
          <FinanceCard label="Валовая разница" value={formatRubles(today.grossProfitRub)} />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3 xl:grid-cols-3">
          <FinanceCard label="Генераций за день" value={String(today.repliesCount)} />
          <FinanceCard label="Успешных платежей" value={String(today.paidPaymentsCount)} />
          <FinanceCard label="Prompt logs за день" value={String(today.promptLogsCount)} />
        </div>
      </Card>

      <Card>
        <div className="mb-2 text-lg font-semibold text-white">Финансовая динамика</div>
        <div className="mb-6 text-sm text-slate-400">
          Здесь отображаются пополнения, начисления пользователям, реальная себестоимость OpenAI и валовая разница по дням.
        </div>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-10 text-center text-slate-400">
            Загружаем статистику...
          </div>
        ) : (
          <AdminFinanceChart
            data={data?.items ?? []}
            period={period}
            onPeriodChange={setPeriod}
          />
        )}
      </Card>
    </div>
  );
}

function DashboardLinkCard({
  href,
  label,
  value,
  hint,
}: {
  href: string;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/10 backdrop-blur transition hover:border-amber-300/50 hover:bg-white/10"
    >
      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</div>
      <div className="mt-3 break-words text-3xl font-semibold text-white">{value}</div>
      <div className="mt-2 text-sm text-slate-400">{hint}</div>
    </Link>
  );
}

function FinanceCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
      <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="mt-2 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}
