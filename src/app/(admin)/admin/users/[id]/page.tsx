'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';
import type { AdminSetUserPasswordResponse } from '@/types/api';
import { toArray } from '@/lib/data';
import { formatMinorToRub } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { ErrorAlert } from '@/components/ui/error-alert';
import { Input } from '@/components/ui/input';
import { KeyValueGrid } from '@/components/ui/key-value-grid';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { PageHeader } from '@/components/ui/page-header';
import { Textarea } from '@/components/ui/textarea';

type AdjustWalletResponse = {
  walletId: string;
  balanceMinor: number;
  balanceRub: number;
  ledgerEntryId: string;
};

export default function AdminUserDetailPage() {
  const params = useParams();
  const id = String(params.id ?? '');

  const [user, setUser] = useState<unknown>(null);
  const [products, setProducts] = useState<unknown>(null);
  const [reviews, setReviews] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  const [amountRub, setAmountRub] = useState('');
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  async function load() {
    try {
      setLoading(true);
      setErrorText('');

      const [userRes, productsRes, reviewsRes] = await Promise.all([
        apiFetch(`/admin/users/${id}`, { method: 'GET', auth: true }),
        apiFetch(`/admin/users/${id}/products`, { method: 'GET', auth: true }),
        apiFetch(`/admin/users/${id}/reviews`, { method: 'GET', auth: true }),
      ]);

      setUser(userRes);
      setProducts(productsRes);
      setReviews(reviewsRes);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось загрузить пользователя');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [id]);

  async function handleManualTopup() {
    setActionError('');
    setActionSuccess('');

    const normalized = amountRub.replace(',', '.').trim();
    const amount = Number(normalized);

    if (!Number.isFinite(amount) || amount <= 0) {
      setActionError('Укажите корректную сумму пополнения в рублях.');
      return;
    }

    if (!reason.trim()) {
      setActionError('Укажите причину ручного пополнения.');
      return;
    }

    try {
      setActionLoading(true);

      const result = await apiFetch<AdjustWalletResponse>('/admin/wallets/adjust', {
        method: 'POST',
        auth: true,
        body: JSON.stringify({
          userId: id,
          amountMinor: Math.round(amount * 100),
          reason: reason.trim(),
          metaJson: {
            source: 'admin-panel-manual-topup',
          },
        }),
      });

      setActionSuccess(
        `Баланс успешно пополнен. Новый баланс: ${formatMinorToRub(result.balanceMinor)}.`,
      );
      setAmountRub('');
      setReason('');
      await load();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Не удалось пополнить баланс');
    } finally {
      setActionLoading(false);
    }
  }


  async function handleSetPassword() {
    setPasswordError('');
    setPasswordSuccess('');

    const normalizedPassword = password.trim();
    const normalizedPasswordConfirm = passwordConfirm.trim();

    if (normalizedPassword.length < 8) {
      setPasswordError('Пароль должен быть не короче 8 символов.');
      return;
    }

    if (normalizedPassword !== normalizedPasswordConfirm) {
      setPasswordError('Пароли не совпадают.');
      return;
    }

    try {
      setPasswordLoading(true);

      await apiFetch<AdminSetUserPasswordResponse>(`/admin/users/${id}/password`, {
        method: 'POST',
        auth: true,
        body: JSON.stringify({
          password: normalizedPassword,
        }),
      });

      setPasswordSuccess('Пароль пользователя успешно обновлён.');
      setPassword('');
      setPasswordConfirm('');
    } catch (error) {
      setPasswordError(
        error instanceof Error ? error.message : 'Не удалось изменить пароль пользователя',
      );
    } finally {
      setPasswordLoading(false);
    }
  }

  if (loading) return <LoadingScreen title="Загружаем пользователя..." />;

  const userRecord =
    user && typeof user === 'object' ? (user as Record<string, unknown>) : null;

  const wallet =
    userRecord?.wallet && typeof userRecord.wallet === 'object'
      ? (userRecord.wallet as Record<string, unknown>)
      : null;

  const balanceMinor =
    wallet && typeof wallet.balanceMinor === 'number' ? wallet.balanceMinor : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Карточка пользователя"
        description="Детали пользователя, связанные товары, генерации и ручное пополнение баланса через админку."
      />

      {errorText ? <ErrorAlert text={errorText} /> : null}

      {user ? (
        <Card>
          <KeyValueGrid
            data={user}
            preferredKeys={[
              'id',
              'email',
              'name',
              'role',
              'isActive',
              'lastLoginAt',
              'createdAt',
              'wallet',
              '_count',
            ]}
          />
        </Card>
      ) : null}

      <Card>
        <div className="mb-4 text-lg font-semibold text-white">Ручное пополнение баланса</div>

        <div className="mb-4 rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
          <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Текущий баланс</div>
          <div className="mt-2 text-lg font-semibold text-white">
            {formatMinorToRub(balanceMinor)}
          </div>
        </div>

        {actionError ? <ErrorAlert text={actionError} /> : null}

        {actionSuccess ? (
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {actionSuccess}
          </div>
        ) : null}

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <div className="mb-2 text-sm font-medium text-white">Сумма пополнения, ₽</div>
            <Input
              value={amountRub}
              onChange={(event) => setAmountRub(event.target.value)}
              placeholder="Например, 100"
              inputMode="decimal"
            />
          </div>

          <div className="md:col-span-2">
            <div className="mb-2 text-sm font-medium text-white">Причина</div>
            <Textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Например: приветственный баланс, компенсация, тестовый доступ"
              className="min-h-[100px]"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={handleManualTopup} disabled={actionLoading}>
            {actionLoading ? 'Пополняем...' : 'Пополнить баланс вручную'}
          </Button>
        </div>
      </Card>

      <Card>
        <div className="mb-4 text-lg font-semibold text-white">Смена пароля пользователя</div>

        {passwordError ? <ErrorAlert text={passwordError} /> : null}

        {passwordSuccess ? (
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {passwordSuccess}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="mb-2 text-sm font-medium text-white">Новый пароль</div>
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Введите новый пароль"
            />
          </div>

          <div>
            <div className="mb-2 text-sm font-medium text-white">Подтверждение пароля</div>
            <Input
              type="password"
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              placeholder="Повторите новый пароль"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={handleSetPassword} disabled={passwordLoading}>
            {passwordLoading ? 'Сохраняем...' : 'Сменить пароль'}
          </Button>
        </div>
      </Card>

      <Card>
        <div className="mb-4 text-lg font-semibold text-white">Товары пользователя</div>
        <DataTable
          rows={toArray(products)}
          preferredColumns={['id', 'article', 'name', 'brand', 'model', 'updatedAt']}
        />
      </Card>

      <Card>
        <div className="mb-4 text-lg font-semibold text-white">Генерации пользователя</div>
        <DataTable
          rows={toArray(reviews)}
          preferredColumns={['id', 'status', 'rating', 'createdAt', 'reviewCost']}
        />
      </Card>
    </div>
  );
}
