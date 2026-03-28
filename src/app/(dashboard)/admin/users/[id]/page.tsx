'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';
import { toArray } from '@/lib/data';
import { formatDateTime, formatMinorToRub } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { ErrorAlert } from '@/components/ui/error-alert';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { JsonBlock } from '@/components/ui/json-block';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { PageHeader } from '@/components/ui/page-header';

export default function AdminUserDetailPage() {
  const params = useParams();
  const userId = String(params.id ?? '');
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [reviews, setReviews] = useState<Record<string, unknown>[]>([]);
  const [payments, setPayments] = useState<Record<string, unknown>[]>([]);
  const [promptLogs, setPromptLogs] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');
  const [amountRub, setAmountRub] = useState('100');
  const [reason, setReason] = useState('Стартовое пополнение / ручная корректировка');
  const [adjusting, setAdjusting] = useState(false);
  const [adjustResult, setAdjustResult] = useState('');

  async function load() {
    const [userRes, productsRes, reviewsRes, paymentsRes, promptLogsRes] = await Promise.all([
      apiFetch(`/admin/users/${encodeURIComponent(userId)}`, { method: 'GET', auth: true }),
      apiFetch(`/admin/users/${encodeURIComponent(userId)}/products`, { method: 'GET', auth: true }),
      apiFetch(`/admin/users/${encodeURIComponent(userId)}/reviews`, { method: 'GET', auth: true }),
      apiFetch('/admin/payments', { method: 'GET', auth: true }),
      apiFetch('/admin/prompt-logs', { method: 'GET', auth: true }),
    ]);

    setUser((userRes && typeof userRes === 'object' ? userRes : null) as Record<string, unknown> | null);
    setProducts(toArray<Record<string, unknown>>(productsRes));
    setReviews(toArray<Record<string, unknown>>(reviewsRes));
    setPayments(
      toArray<Record<string, unknown>>(paymentsRes).filter((item) => {
        const itemUser = item.user as Record<string, unknown> | undefined;
        return String(item.userId ?? itemUser?.id ?? '') === userId;
      }),
    );
    setPromptLogs(toArray<Record<string, unknown>>(promptLogsRes).filter((item) => String(item.userId ?? '') === userId));
  }

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        setErrorText('');
        await load();
      } catch (error) {
        if (!cancelled) setErrorText(error instanceof Error ? error.message : 'Не удалось загрузить пользователя');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const balanceText = useMemo(() => {
    const wallet = user?.wallet as Record<string, unknown> | undefined;
    return typeof wallet?.balanceMinor === 'number' ? formatMinorToRub(wallet.balanceMinor) : '—';
  }, [user]);

  async function handleAdjustWallet() {
    try {
      setAdjusting(true);
      setAdjustResult('');
      const rub = Number(amountRub.replace(',', '.'));
      const amountMinor = Math.round(rub * 100);
      await apiFetch('/admin/wallets/adjust', {
        method: 'POST',
        auth: true,
        body: JSON.stringify({
          userId,
          amountMinor,
          reason,
          metaJson: { source: 'admin-panel' },
        }),
      });
      setAdjustResult('Баланс обновлён');
      await load();
    } catch (error) {
      setAdjustResult(error instanceof Error ? error.message : 'Не удалось скорректировать баланс');
    } finally {
      setAdjusting(false);
    }
  }

  if (loading) return <LoadingScreen title="Загружаем карточку пользователя..." />;

  const productRows = products.slice(0, 20).map((item) => ({
    id: String(item.id ?? '—'),
    article: String(item.article ?? '—'),
    name: String(item.name ?? '—'),
    tonePreset: String(item.tonePreset ?? '—'),
    updatedAt: formatDateTime(item.updatedAt),
  }));

  const reviewRows = reviews.slice(0, 20).map((item) => ({
    id: String(item.id ?? '—'),
    externalId: String(item.reviewExternalId ?? '—'),
    status: String(item.status ?? '—'),
    rating: String(item.rating ?? '—'),
    createdAt: formatDateTime(item.createdAt),
  }));

  const paymentRows = payments.slice(0, 20).map((item) => ({
    id: String(item.id ?? '—'),
    status: String(item.status ?? '—'),
    amount: typeof item.amountMinor === 'number' ? formatMinorToRub(item.amountMinor) : '—',
    createdAt: formatDateTime(item.createdAt),
    paidAt: formatDateTime(item.paidAt),
  }));

  const promptRows = promptLogs.slice(0, 20).map((item) => ({
    id: String(item.id ?? '—'),
    model: String(item.model ?? '—'),
    serviceTierCode: String(item.serviceTierCode ?? '—'),
    createdAt: formatDateTime(item.createdAt),
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Карточка пользователя" description="Профиль, баланс, товары, отзывы, платежи и prompt logs конкретного пользователя." />
      {errorText ? <ErrorAlert text={errorText} /> : null}

      <Card>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoCard label="E-mail" value={String(user?.email ?? '—')} />
          <InfoCard label="Роль" value={String(user?.role ?? '—')} />
          <InfoCard label="Баланс" value={balanceText} />
          <InfoCard label="Активен" value={String(user?.isActive ?? '—')} />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoCard label="Создан" value={formatDateTime(user?.createdAt)} />
          <InfoCard label="Последний вход" value={formatDateTime(user?.lastLoginAt)} />
          <InfoCard label="Товаров" value={String((user?._count as Record<string, unknown> | undefined)?.products ?? '0')} />
          <InfoCard label="Отзывов" value={String((user?._count as Record<string, unknown> | undefined)?.reviewLogs ?? '0')} />
        </div>
      </Card>

      <Card>
        <div className="mb-4 text-lg font-semibold text-white">Ручная корректировка баланса</div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Сумма, ₽" hint="Отрицательное значение уменьшит баланс.">
            <Input value={amountRub} onChange={(event) => setAmountRub(event.target.value)} type="number" step="0.01" />
          </Field>
          <Field label="Причина">
            <Input value={reason} onChange={(event) => setReason(event.target.value)} />
          </Field>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button onClick={handleAdjustWallet} disabled={adjusting}>{adjusting ? 'Сохраняем...' : 'Применить корректировку'}</Button>
          {adjustResult ? <div className="text-sm text-slate-300">{adjustResult}</div> : null}
        </div>
      </Card>

      {paymentRows.length ? <Card><div className="mb-4 text-lg font-semibold text-white">Платежи</div><DataTable rows={paymentRows} preferredColumns={['id', 'status', 'amount', 'createdAt', 'paidAt']} /></Card> : null}
      {productRows.length ? <Card><div className="mb-4 text-lg font-semibold text-white">Товары</div><DataTable rows={productRows} preferredColumns={['id', 'article', 'name', 'tonePreset', 'updatedAt']} /></Card> : null}
      {reviewRows.length ? <Card><div className="mb-4 text-lg font-semibold text-white">Отзывы</div><DataTable rows={reviewRows} preferredColumns={['id', 'externalId', 'status', 'rating', 'createdAt']} /></Card> : null}
      {promptRows.length ? <Card><div className="mb-4 text-lg font-semibold text-white">Prompt logs</div><DataTable rows={promptRows} preferredColumns={['id', 'model', 'serviceTierCode', 'createdAt']} /></Card> : null}

      {user ? <Card><JsonBlock title="Raw user" data={user} /></Card> : null}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
      <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="mt-2 text-sm font-medium text-white">{value}</div>
    </div>
  );
}
