'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { toArray } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { ErrorAlert } from '@/components/ui/error-alert';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { JsonBlock } from '@/components/ui/json-block';
import { PageHeader } from '@/components/ui/page-header';

export default function ExchangeRatesPage() {
  const [data, setData] = useState<unknown>(null);
  const [rate, setRate] = useState('90');
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');

  async function load() {
    try {
      const result = await apiFetch('/admin/exchange-rates', {
        method: 'GET',
        auth: true,
      });
      setData(result);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось загрузить курсы');
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleSubmit() {
    setSubmitting(true);
    setErrorText('');
    setSuccessText('');

    try {
      const numericRate = Number(rate);
      await apiFetch('/admin/exchange-rates', {
        method: 'POST',
        auth: true,
        body: JSON.stringify({
          usdToRub: numericRate,
          rate: numericRate,
          value: numericRate,
        }),
      });
      setSuccessText('Курс сохранён');
      await load();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось сохранить курс');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin: exchange rates"
        description="Просмотр и добавление курса USD → RUB. В payload отправляются несколько возможных полей для совместимости DTO."
      />

      {errorText ? <ErrorAlert text={errorText} /> : null}
      {successText ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {successText}
        </div>
      ) : null}

      <Card>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <Field label="USD → RUB">
            <Input type="number" step="0.0001" value={rate} onChange={(e) => setRate(e.target.value)} />
          </Field>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Сохраняем...' : 'Сохранить курс'}
          </Button>
        </div>
      </Card>

      <Card>
        <DataTable rows={toArray(data)} preferredColumns={['id', 'usdToRub', 'rate', 'value', 'createdAt', 'isActive']} />
      </Card>

      {data ? (
        <Card>
          <JsonBlock title="Raw exchange rates response" data={data} />
        </Card>
      ) : null}
    </div>
  );
}
