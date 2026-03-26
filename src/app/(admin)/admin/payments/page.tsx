  'use client';

  import Link from 'next/link';
  import { useEffect, useState } from 'react';
  import { apiFetch } from '@/lib/api-client';
  import { toArray } from '@/lib/data';
  import { Button } from '@/components/ui/button';
  import { Card } from '@/components/ui/card';
  import { DataTable } from '@/components/ui/data-table';
  import { EmptyState } from '@/components/ui/empty-state';
  import { ErrorAlert } from '@/components/ui/error-alert';
  import { JsonBlock } from '@/components/ui/json-block';
  import { PageHeader } from '@/components/ui/page-header';

  export default function ListPage() {
    const [data, setData] = useState<unknown>(null);
    const [loading, setLoading] = useState(true);
    const [errorText, setErrorText] = useState('');

    async function load() {
      setLoading(true);
      setErrorText('');
      try {
        const result = await apiFetch('/admin/payments', {
          method: 'GET',
          auth: true,
        });
        setData(result);
      } catch (error) {
        setErrorText(error instanceof Error ? error.message : 'Не удалось загрузить список');
      } finally {
        setLoading(false);
      }
    }

    useEffect(() => {
      void load();
    }, []);

    const rows = toArray<Record<string, unknown>>(data);

const linkIds = rows
  .map((row) => {
    if (row && typeof row === 'object' && 'id' in row) {
      return String((row as Record<string, unknown>).id ?? '');
    }
    return '';
  })
  .filter(Boolean);

    return (
      <div className="space-y-6">
        <PageHeader
          title="Admin: платежи"
          description="GET /v1/admin/payments. Все платежи по системе."
          actions={<Button variant="secondary" onClick={() => void load()}>Обновить</Button>}
        />

        {errorText ? <ErrorAlert text={errorText} /> : null}

        {!loading && !rows.length ? <EmptyState title="Записей пока нет" /> : null}

        {rows.length ? (
          <Card>
            <DataTable rows={rows} preferredColumns={["id", "status", "provider", "userId", "amountMinor", "amountRub", "createdAt"]} />

        <div className="mt-4 flex flex-wrap gap-3">
          {linkIds.map((id) => (
            <Link
              key={id}
              href={`/admin/payments/${id}`}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
            >
              Открыть {id}
            </Link>
          ))}
        </div>

          </Card>
        ) : null}

        {data ? (
          <Card>
            <JsonBlock title="Raw backend response" data={data} />
          </Card>
        ) : null}
      </div>
    );
  }
