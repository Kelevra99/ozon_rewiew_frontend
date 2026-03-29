'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { AdminReviewListItem } from '@/types/api';
import { apiFetch } from '@/lib/api-client';
import { formatDateTime, formatRubles } from '@/lib/format';
import { Button, getButtonClassName } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorAlert } from '@/components/ui/error-alert';
import { PageHeader } from '@/components/ui/page-header';

function toNumberValue(value: unknown) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

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

export default function AdminReviewsPage() {
  const [items, setItems] = useState<AdminReviewListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  async function load() {
    setLoading(true);
    setErrorText('');

    try {
      const result = await apiFetch<AdminReviewListItem[]>('/admin/reviews', {
        method: 'GET',
        auth: true,
      });
      setItems(Array.isArray(result) ? result : []);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось загрузить список генераций');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Генерации"
        description="Все сгенерированные ответы по системе с пользователем, товаром и финансовыми показателями."
        actions={<Button variant="secondary" onClick={() => void load()}>Обновить</Button>}
      />

      {errorText ? <ErrorAlert text={errorText} /> : null}

      {!loading && !items.length ? <EmptyState title="Генераций пока нет" /> : null}

      <Card>
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-300">Создано</th>
                  <th className="px-4 py-3 font-medium text-slate-300">Пользователь</th>
                  <th className="px-4 py-3 font-medium text-slate-300">Статус</th>
                  <th className="px-4 py-3 font-medium text-slate-300">Товар</th>
                  <th className="px-4 py-3 font-medium text-slate-300">Оценка</th>
                  <th className="px-4 py-3 font-medium text-slate-300">Режим</th>
                  <th className="px-4 py-3 font-medium text-slate-300">Модель</th>
                  <th className="px-4 py-3 font-medium text-slate-300">Начислено</th>
                  <th className="px-4 py-3 font-medium text-slate-300">Себестоимость</th>
                  <th className="px-4 py-3 font-medium text-slate-300">Действие</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr className="border-t border-white/8">
                    <td colSpan={10} className="px-4 py-8 text-center text-slate-400">
                      Загружаем генерации...
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const chargedRub = toNumberValue(item.reviewCost?.chargedRub);
                    const openAiCostRub = toNumberValue(item.reviewCost?.openAiCostRub);
                    const model = item.reviewCost?.model || item.usageLogs?.[0]?.model || '—';
                    const productName = item.product?.name || item.detectedProductName || '—';
                    const userName = item.user?.email || item.user?.name || '—';

                    return (
                      <tr key={item.id} className="border-t border-white/8">
                        <td className="px-4 py-3 align-top text-white">{formatDateTime(item.createdAt)}</td>
                        <td className="px-4 py-3 align-top text-white">{userName}</td>
                        <td className="px-4 py-3 align-top text-white">{humanStatus(item.status)}</td>
                        <td className="max-w-[320px] px-4 py-3 align-top text-white">
                          <div className="break-words">{productName}</div>
                          {item.product?.article ? (
                            <div className="mt-1 text-xs text-slate-400">Артикул: {item.product.article}</div>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 align-top text-white">{item.rating ?? '—'}</td>
                        <td className="px-4 py-3 align-top text-white">{item.promptMode || '—'}</td>
                        <td className="px-4 py-3 align-top text-white">{model}</td>
                        <td className="px-4 py-3 align-top text-white">{formatRubles(chargedRub)}</td>
                        <td className="px-4 py-3 align-top text-white">{formatRubles(openAiCostRub)}</td>
                        <td className="px-4 py-3 align-top">
                          <Link href={`/admin/reviews/${item.id}`} className={getButtonClassName('primary', 'px-4 py-2')}>
                            Открыть
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
