'use client';

import { useMemo } from 'react';
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
  const path = `/payments/${id}`;
  const { data, loading, errorText } = useRecord<unknown>(path);

  const record = useMemo(
    () => (data && typeof data === 'object' && !Array.isArray(data) ? (data as Record<string, unknown>) : null),
    [data],
  );

  if (loading) return <LoadingScreen title="Загружаем данные..." />;
  if (errorText) {
    return (
      <div className="space-y-6">
        <PageHeader title="Детали платежа" description="Подробности конкретного пополнения пользователя через GET /v1/payments/:id." />
        <ErrorAlert text={errorText} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Детали платежа" description="Подробности конкретного SBP-пополнения пользователя через GET /v1/payments/:id." />
      {record ? (
        <>
          <Card>
            <KeyValueGrid
              data={record}
              preferredKeys={[
                'id',
                'status',
                'provider',
                'paymentMethod',
                'amountMinor',
                'amountRub',
                'providerPaymentId',
                'providerOrderId',
                'providerStatus',
                'paymentUrl',
                'redirectUrl',
                'paidAt',
                'createdAt',
                'updatedAt',
              ]}
            />
          </Card>

          <Card>
            <JsonBlock title="Полный ответ backend" data={record} />
          </Card>
        </>
      ) : (
        <EmptyState title="Данные не найдены" />
      )}
    </div>
  );
}
