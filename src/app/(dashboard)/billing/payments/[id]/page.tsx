'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { PaymentItem } from '@/types/api';
import { apiFetch } from '@/lib/api-client';
import { PaymentStatusPanel } from '@/components/billing/payment-status-panel';
import { Button } from '@/components/ui/button';
import { ErrorAlert } from '@/components/ui/error-alert';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { PageHeader } from '@/components/ui/page-header';

export default function DetailPage() {
  const params = useParams();
  const id = String(params.id ?? '');
  const [payment, setPayment] = useState<PaymentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  async function load() {
    try {
      setLoading(true);
      setErrorText('');
      const response = await apiFetch<PaymentItem>(`/payments/${id}?refresh=1`, {
        method: 'GET',
        auth: true,
      });
      setPayment(response);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось загрузить платёж');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [id]);

  if (loading) return <LoadingScreen title="Загружаем данные о платеже..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Детали платежа"
        description="Здесь отображается текущий статус и реквизиты конкретного пополнения."
        actions={<Button variant="secondary" onClick={() => void load()}>Обновить статус</Button>}
      />

      {errorText ? <ErrorAlert text={errorText} /> : null}
      {payment ? <PaymentStatusPanel payment={payment} /> : null}
    </div>
  );
}
