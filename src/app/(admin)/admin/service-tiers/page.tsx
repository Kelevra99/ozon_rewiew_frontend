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

export default function ServiceTiersPage() {
  const [data, setData] = useState<unknown>(null);
  const [mode, setMode] = useState('standard');
  const [model, setModel] = useState('');
  const [inputPrice, setInputPrice] = useState('');
  const [outputPrice, setOutputPrice] = useState('');
  const [cachedInputPrice, setCachedInputPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');

  async function load() {
    try {
      const result = await apiFetch('/admin/service-tiers', {
        method: 'GET',
        auth: true,
      });
      setData(result);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось загрузить service tiers');
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
      await apiFetch('/admin/service-tiers', {
        method: 'POST',
        auth: true,
        body: JSON.stringify({
          mode,
          name: mode,
          model,
          openAiModel: model,
          inputPer1M: inputPrice ? Number(inputPrice) : undefined,
          outputPer1M: outputPrice ? Number(outputPrice) : undefined,
          cachedInputPer1M: cachedInputPrice ? Number(cachedInputPrice) : undefined,
          inputPricePer1M: inputPrice ? Number(inputPrice) : undefined,
          outputPricePer1M: outputPrice ? Number(outputPrice) : undefined,
          cachedInputPricePer1M: cachedInputPrice ? Number(cachedInputPrice) : undefined,
        }),
      });
      setSuccessText('Service tier сохранён');
      await load();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось сохранить service tier');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin: service tiers"
        description="Редактирование уровней standard / advanced / expert. Поля отправляются с несколькими alias для мягкой совместимости."
      />

      {errorText ? <ErrorAlert text={errorText} /> : null}
      {successText ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {successText}
        </div>
      ) : null}

      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Mode">
            <Input value={mode} onChange={(e) => setMode(e.target.value)} />
          </Field>
          <Field label="OpenAI model">
            <Input value={model} onChange={(e) => setModel(e.target.value)} />
          </Field>
          <Field label="Input price per 1M">
            <Input value={inputPrice} onChange={(e) => setInputPrice(e.target.value)} />
          </Field>
          <Field label="Output price per 1M">
            <Input value={outputPrice} onChange={(e) => setOutputPrice(e.target.value)} />
          </Field>
          <Field label="Cached input price per 1M">
            <Input value={cachedInputPrice} onChange={(e) => setCachedInputPrice(e.target.value)} />
          </Field>
          <div className="flex items-end">
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Сохраняем...' : 'Сохранить tier'}
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <DataTable rows={toArray(data)} preferredColumns={['id', 'mode', 'name', 'model', 'openAiModel', 'inputPer1M', 'outputPer1M', 'cachedInputPer1M']} />
      </Card>

      {data ? (
        <Card>
          <JsonBlock title="Raw service tiers response" data={data} />
        </Card>
      ) : null}
    </div>
  );
}
