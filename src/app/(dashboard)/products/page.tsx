'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ProductItem } from '@/types/api';
import { apiFetch } from '@/lib/api-client';
import { toArray } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorAlert } from '@/components/ui/error-alert';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { JsonBlock } from '@/components/ui/json-block';
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
  extra1Value: string;
  extra2Value: string;
};

function toForm(item: ProductItem | null): ProductForm {
  return {
    name: item?.name ?? '',
    article: item?.article ?? '',
    brand: item?.brand ?? '',
    model: item?.model ?? '',
    kit: item?.kit ?? '',
    annotation: item?.annotation ?? '',
    tonePreset: item?.tonePreset ?? '',
    toneNotes: item?.toneNotes ?? '',
    productRules: item?.productRules ?? '',
    extra1Value: item?.extra1Value ?? '',
    extra2Value: item?.extra2Value ?? '',
  };
}

export default function ProductsPage() {
  const [items, setItems] = useState<ProductItem[]>([]);
  const [selected, setSelected] = useState<ProductItem | null>(null);
  const [form, setForm] = useState<ProductForm>(toForm(null));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');

  async function loadProducts() {
    setLoading(true);
    setErrorText('');
    try {
      const response = await apiFetch<unknown>('/products', {
        method: 'GET',
        auth: true,
      });
      const list = toArray<ProductItem>(response);
      setItems(list);
      if (list.length && !selected) {
        setSelected(list[0]);
        setForm(toForm(list[0]));
      }
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось загрузить товары');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  useEffect(() => {
    setForm(toForm(selected));
  }, [selected]);

  const selectedDetails = useMemo(() => {
    return items.find((item) => item.id === selected?.id) ?? selected;
  }, [items, selected]);

  async function handleSave() {
    if (!selected?.id) return;
    setSaving(true);
    setErrorText('');
    setSuccessText('');

    try {
      const payload = {
  kit: form.kit || null,
  annotation: form.annotation || null,
  tonePreset: form.tonePreset || null,
  toneNotes: form.toneNotes || null,
  productRules: form.productRules || null,
  extra1Value: form.extra1Value || null,
  extra2Value: form.extra2Value || null,
};

      await apiFetch(`/products/${selected.id}`, {
        method: 'PATCH',
        auth: true,
        body: JSON.stringify(payload),
      });

      setSuccessText('Товар обновлён');
      await loadProducts();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось обновить товар');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Товары"
        description="Список товаров пользователя, загруженных в БД. Редактирование идёт по JWT через PATCH /v1/products/:productId."
        actions={
          <Button variant="secondary" onClick={() => void loadProducts()}>
            Обновить
          </Button>
        }
      />

      {errorText ? <ErrorAlert text={errorText} /> : null}
      {successText ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {successText}
        </div>
      ) : null}

      {!loading && !items.length ? (
        <EmptyState
          title="Товары пока не загружены"
          text="Перейди в раздел импорта и загрузи OZON XLSX."
        />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="p-0">
          <div className="border-b border-white/10 px-5 py-4 text-sm font-medium text-white">
            Список товаров
          </div>
          <div className="max-h-[720px] overflow-auto p-3">
            {loading ? (
              <div className="p-4 text-sm text-slate-400">Загрузка товаров...</div>
            ) : (
              <div className="space-y-2">
                {items.map((item) => {
                  const active = selected?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelected(item)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                        active
                          ? 'border-amber-300/50 bg-amber-300/10'
                          : 'border-white/10 bg-slate-950/30 hover:bg-white/5'
                      }`}
                    >
                      <div className="font-medium text-white">{item.name || 'Без названия'}</div>
                      <div className="mt-1 text-xs text-slate-400">
                        {item.article || 'Без артикула'} · {item.brand || 'Без бренда'}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="mb-4 text-lg font-semibold text-white">
              {selected ? 'Редактирование товара' : 'Выбери товар'}
            </div>

            {selected ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Название">
                  <Input value={form.name} readOnly className="opacity-70 cursor-not-allowed" />
                </Field>

                <Field label="Артикул">
                  <Input value={form.article} onChange={(e) => setForm({ ...form, article: e.target.value })} />
                </Field>

                <Field label="Бренд">
                  <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
                </Field>

                <Field label="Модель">
                  <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
                </Field>

                <Field label="Комплект">
                  <Input value={form.kit} onChange={(e) => setForm({ ...form, kit: e.target.value })} />
                </Field>

                <Field label="Tone preset">
                  <Input value={form.tonePreset} onChange={(e) => setForm({ ...form, tonePreset: e.target.value })} />
                </Field>

                <div className="md:col-span-2">
                  <Field label="Аннотация">
                    <Textarea value={form.annotation} onChange={(e) => setForm({ ...form, annotation: e.target.value })} />
                  </Field>
                </div>

                <div className="md:col-span-2">
                  <Field label="Tone notes">
                    <Textarea value={form.toneNotes} onChange={(e) => setForm({ ...form, toneNotes: e.target.value })} />
                  </Field>
                </div>

                <div className="md:col-span-2">
                  <Field label="Product rules">
                    <Textarea value={form.productRules} onChange={(e) => setForm({ ...form, productRules: e.target.value })} />
                  </Field>
                </div>

                <div className="md:col-span-2 flex justify-end">
                  <Button onClick={handleSave} disabled={saving || !selected}>
                    {saving ? 'Сохраняем...' : 'Сохранить'}
                  </Button>
                </div>
              </div>
            ) : (
              <EmptyState title="Нет выбранного товара" />
            )}
          </Card>

          {selectedDetails ? (
            <Card>
              <JsonBlock title="Raw JSON выбранного товара" data={selectedDetails} />
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
