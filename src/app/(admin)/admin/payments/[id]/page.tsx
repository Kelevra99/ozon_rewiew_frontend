'use client';

import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorAlert } from '@/components/ui/error-alert';
import { JsonBlock } from '@/components/ui/json-block';
import { KeyValueGrid } from '@/components/ui/key-value-grid';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { PageHeader } from '@/components/ui/page-header';
import { useRecord } from '@/hooks/use-record';

export default function DetailPage() {
  const params = useParams();
  const id = String(params.id ?? '');
  const path = `/admin/payments/${id}`;
  const { data, loading, errorText } = useRecord<unknown>(path);

  if (loading) return <LoadingScreen title="Загружаем данные..." />;
  if (errorText) {
    return (
      <div className="space-y-6">
        <PageHeader title="Admin: детали платежа" description="GET /v1/admin/payments/:id." />
        <ErrorAlert text={errorText} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Admin: детали платежа" description="GET /v1/admin/payments/:id." />
      {data ? (
        <>
          <Card>
            <KeyValueGrid data={data} preferredKeys={["id", "status", "provider", "userId", "amountMinor", "amountRub", "redirectUrl", "createdAt", "updatedAt"]} />
          </Card>

          <Card>
            <JsonBlock title="Полный ответ backend" data={data} />
          </Card>
        </>
      ) : (
        <EmptyState title="Данные не найдены" />
      )}
    </div>
  );
}
