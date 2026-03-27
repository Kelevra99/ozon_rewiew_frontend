'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { toArray } from '@/lib/data';
import { formatDateTime, formatMinorToRub, formatRubles } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorAlert } from '@/components/ui/error-alert';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';

export default function BillingPage() {
  const [balance, setBalance] = useState<unknown>(null);
  const [ledger, setLedger] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setErrorText('');

        const [balanceRes, ledgerRes] = await Promise.all([
          apiFetch('/billing/balance', { method: 'GET', auth: true }),
          apiFetch('/billing/ledger?take=50', { method: 'GET', auth: true }),
        ]);

        if (!cancelled) {
          setBalance(balanceRes);
          setLedger(ledgerRes);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorText(error instanceof Error ? error.message : 'Не удалось загрузить баланс');
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

  const balanceRecord = balance && typeof balance === 'object' ? (balance as Record<string, unknown>) : null;

  const balanceText =
    typeof balanceRecord?.balanceRub === 'number'
      ? formatRubles(balanceRecord.balanceRub)
      : typeof balanceRecord?.amountRub === 'number'
        ? formatRubles(balanceRecord.amountRub)
        : typeof balanceRecord?.balanceMinor === 'number'
          ? formatMinorToRub(balanceRecord.balanceMinor)
          : typeof balanceRecord?.amountMinor === 'number'
            ? formatMinorToRub(balanceRecord.amountMinor)
            : '—';

  const holdText =
    typeof balanceRecord?.holdRub === 'number'
      ? formatRubles(balanceRecord.holdRub)
      : typeof balanceRecord?.holdMinor === 'number'
        ? formatMinorToRub(balanceRecord.holdMinor)
        : '—';

  const ledgerRows = toArray<Record<string, unknown>>(ledger).map((entry) => ({
    id: String(entry.id ?? ''),
    type: String(entry.type ?? entry.operationType ?? '—'),
    amount:
      typeof entry.amountMinor === 'number'
        ? formatMinorToRub(entry.amountMinor)
        : typeof entry.deltaMinor === 'number'
          ? formatMinorToRub(entry.deltaMinor)
          : '—',
    description: String(entry.description ?? entry.reason ?? '—'),
    createdAt: formatDateTime(entry.createdAt),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Баланс"
        description="Здесь отображается текущий остаток на счёте и история движений по кошельку."
        actions={
          <div className="flex gap-3">
            <Link href="/billing/topup">
              <Button>Пополнить баланс</Button>
            </Link>
          </div>
        }
      />

      {errorText ? <ErrorAlert text={errorText} /> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Текущий баланс" value={loading ? '...' : balanceText} />
        <StatCard label="В резерве" value={loading ? '...' : holdText} />
        <StatCard label="Записей в истории" value={loading ? '...' : String(ledgerRows.length)} />
      </div>

      {ledgerRows.length ? (
        <Card>
          <div className="mb-4 text-lg font-semibold text-white">История операций</div>
          <DataTable rows={ledgerRows} preferredColumns={['id', 'type', 'amount', 'description', 'createdAt']} />
        </Card>
      ) : (
        !loading && <EmptyState title="Операций пока нет" text="После пополнения или списаний здесь появится история." />
      )}
    </div>
  );
}
