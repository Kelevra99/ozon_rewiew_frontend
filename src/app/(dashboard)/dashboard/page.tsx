'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { toArray } from '@/lib/data';
import { formatMinorToRub } from '@/lib/format';
import { useAuth } from '@/components/auth/auth-provider';
import { Card } from '@/components/ui/card';
import { ErrorAlert } from '@/components/ui/error-alert';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';

type DashboardState = {
  products: number;
  apiKeys: number;
  reviews: number;
  balance: string;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [state, setState] = useState<DashboardState>({
    products: 0,
    apiKeys: 0,
    reviews: 0,
    balance: '—',
  });
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setErrorText('');

        const [productsRes, apiKeysRes, reviewsRes, balanceRes] = await Promise.allSettled([
          apiFetch('/products', { method: 'GET', auth: true }),
          apiFetch('/api-keys', { method: 'GET', auth: true }),
          apiFetch('/reviews/history', { method: 'GET', auth: true }),
          apiFetch('/billing/balance', { method: 'GET', auth: true }),
        ]);

        if (cancelled) return;

        const products = productsRes.status === 'fulfilled' ? toArray(productsRes.value).length : 0;
        const apiKeys = apiKeysRes.status === 'fulfilled' ? toArray(apiKeysRes.value).length : 0;
        const reviews = reviewsRes.status === 'fulfilled' ? toArray(reviewsRes.value).length : 0;

        let balance = '—';
        if (balanceRes.status === 'fulfilled' && balanceRes.value && typeof balanceRes.value === 'object') {
          const record = balanceRes.value as Record<string, unknown>;
          if (typeof record.balanceRub === 'number') balance = `${record.balanceRub} ₽`;
          else if (typeof record.amountRub === 'number') balance = `${record.amountRub} ₽`;
          else if (typeof record.balanceMinor === 'number') balance = formatMinorToRub(record.balanceMinor);
          else if (typeof record.amountMinor === 'number') balance = formatMinorToRub(record.amountMinor);
        }

        setState({ products, apiKeys, reviews, balance });
      } catch (error) {
        if (!cancelled) {
          setErrorText(error instanceof Error ? error.message : 'Не удалось загрузить кабинет');
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Дашборд"
        description="Главная точка входа в кабинет. Здесь показаны базовые метрики без смешивания JWT-сессии и API key расширения."
      />

      {errorText ? <ErrorAlert text={errorText} /> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Пользователь" value={user?.name || user?.email || '—'} hint={user?.role ?? 'role'} />
        <StatCard label="Товары" value={loading ? '...' : String(state.products)} />
        <StatCard label="API ключи" value={loading ? '...' : String(state.apiKeys)} />
        <StatCard label="Баланс" value={loading ? '...' : state.balance} />
      </div>

      <Card>
        <div className="text-lg font-semibold text-white">Что уже сделано</div>
        <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            Frontend использует JWT и восстанавливает session через <code>/v1/users/me</code>.
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            Расширение продолжает жить отдельно и использует только <code>sk_user_xxx</code>.
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            Товары, reviews, billing, payments и admin подключаются без изменения backend-контракта.
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            Падения из-за нестабильных DTO смягчены таблицами и JSON fallback.
          </div>
        </div>
      </Card>
    </div>
  );
}
