'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProductItem } from '@/types/api';
import { apiFetch } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorAlert } from '@/components/ui/error-alert';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { Textarea } from '@/components/ui/textarea';

type ProductForm = {
  name: string;
  article: string;
  brand: string;
  model: string;
  kit: string;
  annotation: string;
  tonePreset: string;
  toneNotes: string;
  productRules: string;
  extra1Name: string;
  extra1Value: string;
  extra2Name: string;
  extra2Value: string;
};

function emptyForm(): ProductForm {
  return {
    name: '',
    article: '',
    brand: '',
    model: '',
    kit: '',
    annotation: '',
    tonePreset: '',
    toneNotes: '',
    productRules: '',
    extra1Name: '',
    extra1Value: '',
    extra2Name: '',
    extra2Value: '',
  };
}

function normalizePayload(form: ProductForm) {
  const name = form.name.trim();
  if (!name) {
    throw new Error('Название товара обязательно');
  }

  const normalize = (value: string) => {
    const cleaned = value.trim();
    return cleaned.length ? cleaned : null;
  };

  return {
    name,
    article: normalize(form.article),
    brand: normalize(form.brand),
    model: normalize(form.model),
    kit: normalize(form.kit),
    annotation: normalize(form.annotation),
    tonePreset: normalize(form.tonePreset),
    toneNotes: normalize(form.toneNotes),
    productRules: normalize(form.productRules),
    extra1Name: normalize(form.extra1Name),
    extra1Value: normalize(form.extra1Value),
    extra2Name: normalize(form.extra2Name),
    extra2Value: normalize(form.extra2Value),
  };
}

export default function ProductCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState<ProductForm>(emptyForm());
  const [creating, setCreating] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');

  async function handleCreate() {
    setCreating(true);
    setErrorText('');
    setSuccessText('');

    try {
      const created = await apiFetch<ProductItem>('/products', {
        method: 'POST',
        auth: true,
        body: JSON.stringify(normalizePayload(form)),
      });

      setForm(emptyForm());
      setSuccessText(`Товар создан: ${created.name}`);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось создать товар');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Добавить товар"
        description="Отдельная форма для ручного создания карточки товара без импорта шаблона OZON."
        actions={
          <Button variant="secondary" onClick={() => router.push('/products')}>
            К списку товаров
          </Button>
        }
      />

      {errorText ? <ErrorAlert text={errorText} /> : null}
      {successText ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {successText}
        </div>
      ) : null}

      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Название">
            <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
          </Field>

          <Field label="Артикул">
            <Input value={form.article} onChange={(e) => setForm((prev) => ({ ...prev, article: e.target.value }))} />
          </Field>

          <Field label="Бренд">
            <Input value={form.brand} onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value }))} />
          </Field>

          <Field label="Модель">
            <Input value={form.model} onChange={(e) => setForm((prev) => ({ ...prev, model: e.target.value }))} />
          </Field>

          <Field label="Комплект">
            <Input value={form.kit} onChange={(e) => setForm((prev) => ({ ...prev, kit: e.target.value }))} />
          </Field>

          <Field label="Tone preset">
            <Input value={form.tonePreset} onChange={(e) => setForm((prev) => ({ ...prev, tonePreset: e.target.value }))} />
          </Field>

          <Field label="Название доп. поля 1">
            <Input value={form.extra1Name} onChange={(e) => setForm((prev) => ({ ...prev, extra1Name: e.target.value }))} />
          </Field>

          <Field label="Значение доп. поля 1">
            <Input value={form.extra1Value} onChange={(e) => setForm((prev) => ({ ...prev, extra1Value: e.target.value }))} />
          </Field>

          <Field label="Название доп. поля 2">
            <Input value={form.extra2Name} onChange={(e) => setForm((prev) => ({ ...prev, extra2Name: e.target.value }))} />
          </Field>

          <Field label="Значение доп. поля 2">
            <Input value={form.extra2Value} onChange={(e) => setForm((prev) => ({ ...prev, extra2Value: e.target.value }))} />
          </Field>

          <div className="md:col-span-2">
            <Field label="Аннотация">
              <Textarea value={form.annotation} onChange={(e) => setForm((prev) => ({ ...prev, annotation: e.target.value }))} />
            </Field>
          </div>

          <div className="md:col-span-2">
            <Field label="Tone notes">
              <Textarea value={form.toneNotes} onChange={(e) => setForm((prev) => ({ ...prev, toneNotes: e.target.value }))} />
            </Field>
          </div>

          <div className="md:col-span-2">
            <Field label="Product rules">
              <Textarea value={form.productRules} onChange={(e) => setForm((prev) => ({ ...prev, productRules: e.target.value }))} />
            </Field>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? 'Создаём...' : 'Добавить товар'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
