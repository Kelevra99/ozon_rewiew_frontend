'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { PaginatedReviewHistoryResponse, ReviewLogItem } from '@/types/api';
import { apiFetch } from '@/lib/api-client';
import { formatDateTime } from '@/lib/format';
import { Button, getButtonClassName } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorAlert } from '@/components/ui/error-alert';
import { PageHeader } from '@/components/ui/page-header';

const PAGE_SIZE = 50;

function humanStatus(status?: string | null) {
  switch (status) {
    case 'generated':
      return 'Сгенерирован';
    case 'inserted':
      return 'Вставлен';
    case 'posted':
      return 'Опубликован';
    case 'skipped':
      return 'Пропущен';
    case 'failed':
      return 'Ошибка';
    case 'canceled':
      return 'Отменён';
    default:
      return '—';
  }
}

function getProductName(item: ReviewLogItem) {
  return item.matchedProduct?.name || item.productName || '—';
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

export default function ReviewsPage() {
  const [items, setItems] = useState<ReviewLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  async function loadReviews(targetPage = page) {
    setLoading(true);
    setErrorText('');

    try {
      const result = await apiFetch<PaginatedReviewHistoryResponse>(
        `/reviews/history?page=${targetPage}&limit=${PAGE_SIZE}`,
        {
          method: 'GET',
          auth: true,
        },
      );

      setItems(result.items);
      setPage(result.pagination.page);
      setTotalPages(result.pagination.totalPages);
      setTotalItems(result.pagination.total);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось загрузить историю');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReviews(page);
  }, [page]);

  const pageItems = useMemo(() => buildPageItems(page, totalPages), [page, totalPages]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="История отзывов"
        description="Здесь отображаются все сгенерированные ответы с разбивкой по страницам."
        actions={
          <Button variant="secondary" onClick={() => void loadReviews(page)}>
            Обновить
          </Button>
        }
      />

      {errorText ? <ErrorAlert text={errorText} /> : null}

      {!loading && !items.length ? (
        <EmptyState title="История пока пустая" text="Сгенерируйте первый ответ через расширение." />
      ) : null}

      {(loading || items.length > 0) ? (
        <Card>
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-300">ID</th>
                    <th className="px-4 py-3 font-medium text-slate-300">Статус</th>
                    <th className="px-4 py-3 font-medium text-slate-300">Оценка</th>
                    <th className="px-4 py-3 font-medium text-slate-300">Товар</th>
                    <th className="px-4 py-3 font-medium text-slate-300">Маркетплейс</th>
                    <th className="px-4 py-3 font-medium text-slate-300">Создан</th>
                    <th className="px-4 py-3 font-medium text-slate-300">Действие</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr className="border-t border-white/8">
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                        Загружаем историю...
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id} className="border-t border-white/8">
                        <td className="max-w-[220px] px-4 py-3 align-top text-xs text-slate-300">
                          <div className="break-all">{item.id}</div>
                        </td>

                        <td className="px-4 py-3 align-top text-white">
                          {humanStatus(item.status)}
                        </td>

                        <td className="px-4 py-3 align-top text-white">
                          {item.rating ?? '—'}
                        </td>

                        <td className="max-w-[320px] px-4 py-3 align-top text-white">
                          <div className="break-words">{getProductName(item)}</div>
                          {item.matchedProduct?.article ? (
                            <div className="mt-1 text-xs text-slate-400">
                              Артикул: {item.matchedProduct.article}
                            </div>
                          ) : null}
                        </td>

                        <td className="px-4 py-3 align-top text-white">Ozon</td>

                        <td className="px-4 py-3 align-top text-white">
                          {formatDateTime(item.createdAt)}
                        </td>

                        <td className="px-4 py-3 align-top">
                          <Link
                            href={`/reviews/${item.id}`}
                            className={getButtonClassName('primary', 'px-4 py-2')}
                          >
                            Открыть отзыв
                          </Link>
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
                Всего отзывов: {totalItems}. Страница {page} из {totalPages}.
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
                    <span
                      key={`dots-${index}`}
                      className="px-2 text-sm text-slate-500"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPage(item)}
                      className={`inline-flex h-10 min-w-10 items-center justify-center rounded-2xl px-3 text-sm font-medium transition ${
                        item === page
                          ? getButtonClassName('primary', 'h-10 min-w-10 px-3 py-0')
                          : 'inline-flex h-10 min-w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-3 text-sm font-medium text-slate-200 transition hover:bg-white/10'
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
      ) : null}
    </div>
  );
}
