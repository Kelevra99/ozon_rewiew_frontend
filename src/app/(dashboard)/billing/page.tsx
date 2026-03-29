'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { formatDateTime, formatMinorToRub, formatRubles } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorAlert } from '@/components/ui/error-alert';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';

const PAGE_SIZE = 50;

type BillingBalance = {
  balanceMinor?: number;
  holdMinor?: number;
  balanceRub?: number;
  holdRub?: number;
};

type LedgerItem = {
  id: string;
  type: string;
  amountMinor: number;
  description?: string | null;
  createdAt?: string | null;
  referenceType?: string | null;
  referenceId?: string | null;
};

type LedgerResponse = {
  items: LedgerItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasPrev: boolean;
    hasNext: boolean;
  };
};

function humanType(type?: string | null) {
  switch (type) {
    case 'topup':
      return 'Пополнение';
    case 'debit_review_generation':
      return 'Списание за генерацию';
    case 'refund':
      return 'Возврат';
    case 'manual_adjustment':
      return 'Ручная корректировка';
    case 'promo_credit':
      return 'Бонусное начисление';
    default:
      return type || '—';
  }
}

function buildPageItems(current: number, total: number): Array<number | 'dots'> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const result: Array<number | 'dots'> = [1];

  if (current > 3) {
    result.push('dots');
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let page = start; page <= end; page += 1) {
    result.push(page);
  }

  if (current < total - 2) {
    result.push('dots');
  }

  result.push(total);

  return result;
}

export default function BillingPage() {
  const [balance, setBalance] = useState<BillingBalance | null>(null);
  const [ledgerItems, setLedgerItems] = useState<LedgerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  async function load(targetPage = page) {
    try {
      setLoading(true);
      setErrorText('');

      const [balanceRes, ledgerRes] = await Promise.all([
        apiFetch<BillingBalance>('/billing/balance', { method: 'GET', auth: true }),
        apiFetch<LedgerResponse>(`/billing/ledger?page=${targetPage}&limit=${PAGE_SIZE}`, {
          method: 'GET',
          auth: true,
        }),
      ]);

      setBalance(balanceRes);
      setLedgerItems(ledgerRes.items);
      setPage(ledgerRes.pagination.page);
      setTotalPages(ledgerRes.pagination.totalPages);
      setTotalItems(ledgerRes.pagination.total);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось загрузить баланс');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(page);
  }, [page]);

  const balanceText =
    typeof balance?.balanceRub === 'number'
      ? formatRubles(balance.balanceRub)
      : typeof balance?.balanceMinor === 'number'
        ? formatMinorToRub(balance.balanceMinor)
        : '—';

  const holdText =
    typeof balance?.holdRub === 'number'
      ? formatRubles(balance.holdRub)
      : typeof balance?.holdMinor === 'number'
        ? formatMinorToRub(balance.holdMinor)
        : '—';

  const pageItems = useMemo(() => buildPageItems(page, totalPages), [page, totalPages]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Баланс"
        description="Здесь отображается текущий остаток и полная история движений по кошельку пользователя."
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
        <StatCard label="Всего операций" value={loading ? '...' : String(totalItems)} />
      </div>

      {ledgerItems.length ? (
        <Card>
          <div className="mb-4 text-lg font-semibold text-white">История операций</div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-300">ID операции</th>
                    <th className="px-4 py-3 font-medium text-slate-300">Тип операции</th>
                    <th className="px-4 py-3 font-medium text-slate-300">Сумма</th>
                    <th className="px-4 py-3 font-medium text-slate-300">Описание</th>
                    <th className="px-4 py-3 font-medium text-slate-300">Дата</th>
                    <th className="px-4 py-3 font-medium text-slate-300">Действие</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr className="border-t border-white/8">
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        Загружаем операции...
                      </td>
                    </tr>
                  ) : (
                    ledgerItems.map((entry) => (
                      <tr key={entry.id} className="border-t border-white/8">
                        <td className="max-w-[220px] px-4 py-3 align-top text-xs text-slate-300">
                          <div className="break-all">{entry.id}</div>
                        </td>

                        <td className="px-4 py-3 align-top text-white">
                          {humanType(entry.type)}
                        </td>

                        <td
                          className={`px-4 py-3 align-top font-medium ${
                            entry.amountMinor >= 0 ? 'text-emerald-300' : 'text-rose-300'
                          }`}
                        >
                          {formatMinorToRub(entry.amountMinor)}
                        </td>

                        <td className="max-w-[420px] px-4 py-3 align-top text-white">
                          <div className="break-words">{entry.description || '—'}</div>
                        </td>

                        <td className="px-4 py-3 align-top text-white">
                          {formatDateTime(entry.createdAt)}
                        </td>

                        <td className="px-4 py-3 align-top">
                          {entry.referenceType === 'review_log' && entry.referenceId ? (
                            <Link
                              href={`/reviews/${entry.referenceId}`}
                              className="inline-flex items-center justify-center rounded-2xl bg-amber-300 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-amber-200"
                            >
                              Открыть отзыв
                            </Link>
                          ) : (
                            <span className="text-sm text-slate-500">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {!loading && totalPages > 1 ? (
            <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-slate-400">
                Всего операций: {totalItems}. Страница {page} из {totalPages}.
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                >
                  Назад
                </Button>

                {pageItems.map((item, index) =>
                  item === 'dots' ? (
                    <span key={`dots-${index}`} className="px-2 text-sm text-slate-500">
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPage(item)}
                      className={`inline-flex h-10 min-w-10 items-center justify-center rounded-2xl px-3 text-sm font-medium transition ${
                        item === page
                          ? 'bg-amber-300 text-slate-950'
                          : 'border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                      }`}
                    >
                      {item}
                    </button>
                  ),
                )}

                <Button
                  variant="secondary"
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                >
                  Вперёд
                </Button>
              </div>
            </div>
          ) : null}
        </Card>
      ) : (
        !loading && (
          <EmptyState
            title="Операций пока нет"
            text="После пополнения или списаний здесь появится история."
          />
        )
      )}
    </div>
  );
}
