'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { UserDto } from '@/types/api';
import { apiFetch } from '@/lib/api-client';
import { toArray } from '@/lib/data';
import { formatDateTime, formatMinorToRub } from '@/lib/format';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorAlert } from '@/components/ui/error-alert';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';

type ProfileUser = UserDto & {
  createdAt?: string;
};

type ProfileState = {
  user: ProfileUser | null;
  balance: string;
  productsCount: number;
  apiKeysCount: number;
  reviewsCount: number;
};

function humanRole(role?: string | null) {
  switch (role) {
    case 'superadmin':
      return 'Суперадминистратор';
    case 'admin':
      return 'Администратор';
    case 'user':
      return 'Пользователь';
    default:
      return '—';
  }
}

function humanStatus(isActive?: boolean) {
  if (isActive === true) return 'Активен';
  if (isActive === false) return 'Отключён';
  return '—';
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
      <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="mt-2 text-sm font-medium text-white whitespace-pre-wrap break-words">{value}</div>
    </div>
  );
}

export default function ProfilePage() {
  const { user: authUser } = useAuth();

  const [state, setState] = useState<ProfileState>({
    user: null,
    balance: '—',
    productsCount: 0,
    apiKeysCount: 0,
    reviewsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setErrorText('');

        const [userRes, balanceRes, productsRes, apiKeysRes, reviewsRes] = await Promise.allSettled([
          apiFetch<ProfileUser>('/users/me', { method: 'GET', auth: true }),
          apiFetch('/billing/balance', { method: 'GET', auth: true }),
          apiFetch('/products', { method: 'GET', auth: true }),
          apiFetch('/api-keys', { method: 'GET', auth: true }),
          apiFetch('/reviews/history?page=1&limit=1', { method: 'GET', auth: true }),
        ]);

        if (cancelled) return;

        const nextUser =
          userRes.status === 'fulfilled'
            ? userRes.value
            : authUser
              ? ({ ...authUser } as ProfileUser)
              : null;

        let balance = '—';
        if (balanceRes.status === 'fulfilled' && balanceRes.value && typeof balanceRes.value === 'object') {
          const record = balanceRes.value as Record<string, unknown>;
          if (typeof record.balanceMinor === 'number') {
            balance = formatMinorToRub(record.balanceMinor);
          } else if (typeof record.amountMinor === 'number') {
            balance = formatMinorToRub(record.amountMinor);
          }
        }

        const productsCount =
          productsRes.status === 'fulfilled'
            ? toArray(productsRes.value).length
            : 0;

        const apiKeysCount =
          apiKeysRes.status === 'fulfilled'
            ? toArray(apiKeysRes.value).length
            : 0;

        let reviewsCount = 0;
        if (reviewsRes.status === 'fulfilled' && reviewsRes.value && typeof reviewsRes.value === 'object') {
          const record = reviewsRes.value as Record<string, unknown>;
          const pagination =
            record.pagination && typeof record.pagination === 'object'
              ? (record.pagination as Record<string, unknown>)
              : null;

          if (typeof pagination?.total === 'number') {
            reviewsCount = pagination.total;
          }
        }

        setState({
          user: nextUser,
          balance,
          productsCount,
          apiKeysCount,
          reviewsCount,
        });
      } catch (error) {
        if (!cancelled) {
          setErrorText(error instanceof Error ? error.message : 'Не удалось загрузить профиль');
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
  }, [authUser]);

  const user = state.user;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Профиль"
        description="Здесь собрана основная информация об аккаунте, статусе кабинета и краткая сводка по вашей работе."
        actions={
          <Link href="/profile/break">
            <Button variant="secondary">Отдохнуть 2 минуты</Button>
          </Link>
        }
      />

      {errorText ? <ErrorAlert text={errorText} /> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Баланс" value={loading ? '...' : state.balance} />
        <StatCard label="Товары" value={loading ? '...' : String(state.productsCount)} />
        <StatCard label="API-ключи" value={loading ? '...' : String(state.apiKeysCount)} />
        <StatCard label="Ответы на отзывы" value={loading ? '...' : String(state.reviewsCount)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <div className="mb-4 text-lg font-semibold text-white">Основная информация</div>
          <div className="grid gap-4 md:grid-cols-2">
            <InfoRow label="Имя" value={user?.name || '—'} />
            <InfoRow label="E-mail" value={user?.email || '—'} />
            <InfoRow label="Статус аккаунта" value={humanStatus(user?.isActive)} />
            <InfoRow label="Роль" value={humanRole(user?.role)} />
          </div>
        </Card>

        <Card>
          <div className="mb-4 text-lg font-semibold text-white">Аккаунт</div>
          <div className="grid gap-4 md:grid-cols-2">
            <InfoRow
              label="Дата регистрации"
              value={user?.createdAt ? formatDateTime(user.createdAt) : '—'}
            />
            <InfoRow
              label="Последний вход"
              value={user?.lastLoginAt ? formatDateTime(user.lastLoginAt) : '—'}
            />
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-4 text-lg font-semibold text-white">Быстрые действия</div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Link href="/products">
            <Button className="w-full">Открыть товары</Button>
          </Link>

          <Link href="/api-keys">
            <Button variant="secondary" className="w-full">Открыть API-ключи</Button>
          </Link>

          <Link href="/billing">
            <Button variant="secondary" className="w-full">Открыть баланс</Button>
          </Link>

          <Link href="/billing/topup">
            <Button variant="secondary" className="w-full">Пополнить баланс</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
