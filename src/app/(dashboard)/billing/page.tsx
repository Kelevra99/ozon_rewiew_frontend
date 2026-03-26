'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { toArray } from '@/lib/data';
import { formatDateTime, formatMinorToRub, formatRubles } from '@/lib/format';
import type { PaymentItem, WalletBalanceResponse } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorAlert } from '@/components/ui/error-alert';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';

export default function BillingPage() {
  const [balance, setBalance] = useState<WalletBalanceResponse | null>(null);
  const [ledger, setLedger] = useState<Record<string, unknown>[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setErrorText('');

        const [balanceRes, ledgerRes, paymentsRes] = await Promise.all([
          apiFetch<WalletBalanceResponse>('/billing/balance', { method: 'GET', auth: true }),
          apiFetch('/billing/ledger?take=20', { method: 'GET', auth: true }),
          apiFetch('/payments', { method: 'GET', auth: true }),
        ]);

        if (!cancelled) {
          setBalance(balanceRes);
          setLedger(toArray<Record<string, unknown>>(ledgerRes));
          setPayments(toArray<PaymentItem>(paymentsRes).slice(0, 5));
        }
      } catch (error) {
        if (!cancelled) {
          setErrorText(error instanceof Error ? error.message : 'Не удалось загрузить billing');
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

  const balanceText =
    typeof balance?.balanceRub === 'number'
      ? formatRubles(balance.balanceRub)
      : typeof balance?.balanceMinor === 'number'
        ? formatMinorToRub(balance.balanceMinor)
        : '—';

  const ledgerRows = ledger.map((entry) => ({
    id: String(entry.id ?? ''),
    type: String(entry.type ?? '—'),
    amount:
      typeof entry.amountMinor === 'number'
        ? formatMinorToRub(entry.amountMinor)
        : typeof entry.deltaMinor === 'number'
          ? formatMinorToRub(entry.deltaMinor)
          : '—',
    description: String(entry.description ?? '—'),
    createdAt: formatDateTime(entry.createdAt),
  }));

  const paymentRows = payments.map((item) => ({
    id: item.id,
    status: item.status ?? '—',
    amount: typeof item.amountMinor === 'number' ? formatMinorToRub(item.amountMinor) : '—',
    method: item.paymentMethod ?? '—',
    createdAt: formatDateTime(item.createdAt),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Баланс и движения"
        description="Баланс пользователя, последние движения кошелька и последние пополнения через Ozon Acquiring SBP."
        actions={
          <div className="flex gap-3">
            <Link href="/billing/topup">
              <Button>Пополнить баланс</Button>
            </Link>
            <Link href="/billing/payments">
              <Button variant="secondary">Все платежи</Button>
            </Link>
          </div>
        }
      />

      {errorText ? <ErrorAlert text={errorText} /> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Текущий баланс" value={loading ? '...' : balanceText} />
        <StatCard label="Валюта" value={loading ? '...' : (balance?.currency ?? 'RUB')} />
        <StatCard label="Последнее обновление" value={loading ? '...' : formatDateTime(balance?.updatedAt)} />
      </div>

      {paymentRows.length ? (
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="text-lg font-semibold text-white">Последние платежи</div>
            <Link href="/billing/payments" className="text-sm text-amber-300 hover:text-amber-200">
              Открыть все
            </Link>
          </div>
          <DataTable rows={paymentRows} preferredColumns={['id', 'status', 'amount', 'method', 'createdAt']} />
        </Card>
      ) : null}

      {ledgerRows.length ? (
        <Card>
          <div className="mb-4 text-lg font-semibold text-white">Последние движения по счёту</div>
          <DataTable rows={ledgerRows} preferredColumns={['id', 'type', 'amount', 'description', 'createdAt']} />
        </Card>
      ) : (
        !loading && <EmptyState title="Движений пока нет" />
      )}
    </div>
  );
}
