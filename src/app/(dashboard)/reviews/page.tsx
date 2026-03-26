'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { ReviewLogItem } from '@/types/api';
import { apiFetch } from '@/lib/api-client';
import { toArray } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorAlert } from '@/components/ui/error-alert';
import { PageHeader } from '@/components/ui/page-header';

export default function ReviewsPage() {
  const [items, setItems] = useState<ReviewLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  async function loadReviews() {
    setLoading(true);
    setErrorText('');

    try {
      const result = await apiFetch('/reviews/history', {
        method: 'GET',
        auth: true,
      });
      setItems(toArray<ReviewLogItem>(result));
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось загрузить историю');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReviews();
  }, []);

  const rows = items.map((item) => ({
    id: item.id,
    status: item.status ?? '—',
    rating: item.rating != null ? String(item.rating) : '—',
    productName: item.productName ?? item.matchedProduct ?? '—',
    marketplace: item.marketplace ?? '—',
    createdAt: String(item.createdAt ?? '—'),
    open: 'Открыть /reviews/' + item.id,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="История генераций"
        description="Данные из /v1/reviews/history. Здесь отображаются генерации, которые были сделаны через extension API key, но видны пользователю в кабинете через JWT."
        actions={
          <Button variant="secondary" onClick={() => void loadReviews()}>
            Обновить
          </Button>
        }
      />

      {errorText ? <ErrorAlert text={errorText} /> : null}

      {!loading && !rows.length ? (
        <EmptyState title="История пока пустая" text="Сгенерируй первый ответ через расширение." />
      ) : null}

      {rows.length ? (
        <Card>
          <DataTable rows={rows} preferredColumns={['id', 'status', 'rating', 'productName', 'marketplace', 'createdAt', 'open']} />
          <div className="mt-4 flex flex-wrap gap-3">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/reviews/${item.id}`}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
              >
                Открыть {item.id}
              </Link>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
