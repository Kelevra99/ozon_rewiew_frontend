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
      const result = await apiFetch('/admin/prompt-logs', {
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin: prompt logs"
        description="GET /v1/admin/prompt-logs. Полезно для аудита реальных prompt и generatedReply."
        actions={<Button variant="secondary" onClick={() => void load()}>Обновить</Button>}
      />

      {errorText ? <ErrorAlert text={errorText} /> : null}

      {!loading && !rows.length ? <EmptyState title="Записей пока нет" /> : null}

      {rows.length ? (
        <Card>
          <DataTable rows={rows} preferredColumns={["id", "reviewLogId", "model", "createdAt"]} />

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
