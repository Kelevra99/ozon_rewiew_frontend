'use client';

import { useEffect, useState } from 'react';
import type { DashboardDailyStatsResponse } from '@/types/api';
import { apiFetch } from '@/lib/api-client';
import { toArray } from '@/lib/data';
import { formatMinorToRub } from '@/lib/format';
import { useAuth } from '@/components/auth/auth-provider';
import { DashboardActivityChart } from '@/components/dashboard/dashboard-activity-chart';
import { Card } from '@/components/ui/card';
import { ErrorAlert } from '@/components/ui/error-alert';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';

type DashboardState = {
  products: number;
  apiKeys: number;
  balance: string;
};

export default function DashboardPage() {
  const { user } = useAuth();

  const [state, setState] = useState<DashboardState>({
    products: 0,
    apiKeys: 0,
    balance: '—',
  });
  const [dailyStats, setDailyStats] = useState<DashboardDailyStatsResponse['items']>([]);
  const [period, setPeriod] = useState<7 | 30 | 90>(30);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadBase() {
      try {
        setLoading(true);
        setErrorText('');

        const [productsRes, apiKeysRes, balanceRes] = await Promise.allSettled([
          apiFetch('/products', { method: 'GET', auth: true }),
          apiFetch('/api-keys', { method: 'GET', auth: true }),
          apiFetch('/billing/balance', { method: 'GET', auth: true }),
        ]);

        if (cancelled) return;

        const products = productsRes.status === 'fulfilled' ? toArray(productsRes.value).length : 0;
        const apiKeys = apiKeysRes.status === 'fulfilled' ? toArray(apiKeysRes.value).length : 0;

        let balance = '—';
        if (balanceRes.status === 'fulfilled' && balanceRes.value && typeof balanceRes.value === 'object') {
          const record = balanceRes.value as Record<string, unknown>;
          if (typeof record.balanceMinor === 'number') {
            balance = formatMinorToRub(record.balanceMinor);
          } else if (typeof record.amountMinor === 'number') {
            balance = formatMinorToRub(record.amountMinor);
          }
        }

        setState({ products, apiKeys, balance });
      } catch (error) {
        if (!cancelled) {
          setErrorText(error instanceof Error ? error.message : 'Не удалось загрузить кабинет');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadBase();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        setStatsLoading(true);

        const stats = await apiFetch<DashboardDailyStatsResponse>(`/reviews/stats/daily?days=${period}`, {
          method: 'GET',
          auth: true,
        });

        if (!cancelled) {
          setDailyStats(Array.isArray(stats.items) ? stats.items : []);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorText(error instanceof Error ? error.message : 'Не удалось загрузить статистику');
        }
      } finally {
        if (!cancelled) {
          setStatsLoading(false);
        }
      }
    }

    void loadStats();

    return () => {
      cancelled = true;
    };
  }, [period]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Дашборд"
        description="Здесь собрана основная информация по кабинету: пользователь, товары, API-ключи, баланс и активность ответов на отзывы."
      />

      {errorText ? <ErrorAlert text={errorText} /> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Пользователь"
          value={user?.name || user?.email || '—'}
          hint={user?.name && user?.email ? user.email : user?.role ?? undefined}
        />
        <StatCard label="Товары" value={loading ? '...' : String(state.products)} />
        <StatCard label="API-ключи" value={loading ? '...' : String(state.apiKeys)} />
        <StatCard label="Баланс" value={loading ? '...' : state.balance} />
      </div>

      <Card>
        <div className="mb-2 text-lg font-semibold text-white">Активность</div>
        <div className="mb-6 text-sm text-slate-400">
          Статистика показывает расход по дням и детали по выбранной дате.
        </div>

        {statsLoading ? (
          <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-10 text-center text-slate-400">
            Загружаем статистику...
          </div>
        ) : (
          <DashboardActivityChart
            data={dailyStats}
            period={period}
            onPeriodChange={setPeriod}
          />
        )}
      </Card>
    </div>
  );
}
