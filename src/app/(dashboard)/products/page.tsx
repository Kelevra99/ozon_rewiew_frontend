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
    extra1Name: item?.extra1Name ?? '',
    extra1Value: item?.extra1Value ?? '',
    extra2Name: item?.extra2Name ?? '',
    extra2Value: item?.extra2Value ?? '',
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

export default function ProductsPage() {
  const [items, setItems] = useState<ProductItem[]>([]);
  const [selected, setSelected] = useState<ProductItem | null>(null);
  const [editForm, setEditForm] = useState<ProductForm>(emptyForm());
  const [createForm, setCreateForm] = useState<ProductForm>(emptyForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');

  async function loadProducts(preferredId?: string) {
    setLoading(true);
    setErrorText('');

    try {
      const response = await apiFetch<unknown>('/products', {
        method: 'GET',
        auth: true,
      });

      const list = toArray<ProductItem>(response);
      setItems(list);

      const nextSelected =
        (preferredId ? list.find((item) => item.id === preferredId) : null) ??
        (selected ? list.find((item) => item.id === selected.id) : null) ??
        list[0] ??
        null;

      setSelected(nextSelected);
      setEditForm(toForm(nextSelected));
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
    setEditForm(toForm(selected));
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
      await apiFetch(`/products/${selected.id}`, {
        method: 'PATCH',
        auth: true,
        body: JSON.stringify(normalizePayload(editForm)),
      });

      setSuccessText('Товар обновлён');
      await loadProducts(selected.id);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось обновить товар');
    } finally {
      setSaving(false);
    }
  }

  async function handleCreate() {
    setCreating(true);
    setErrorText('');
    setSuccessText('');

    try {
      const created = await apiFetch<ProductItem>('/products', {
        method: 'POST',
        auth: true,
        body: JSON.stringify(normalizePayload(createForm)),
      });

      setCreateForm(emptyForm());
      setSuccessText('Товар создан');
      await loadProducts(created.id);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось создать товар');
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete() {
    if (!selected?.id) return;

    const ok = window.confirm(`Удалить товар "${selected.name}"?`);
    if (!ok) return;

    setDeleting(true);
    setErrorText('');
    setSuccessText('');

    try {
      await apiFetch(`/products/${selected.id}`, {
        method: 'DELETE',
        auth: true,
      });

      setSuccessText('Товар удалён');
      setSelected(null);
      setEditForm(emptyForm());
      await loadProducts();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось удалить товар');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Товары"
        description="Теперь можно не только импортировать из шаблона OZON, но и добавлять товары вручную, редактировать и удалять их."
        actions={
          <Button variant="secondary" onClick={() => void loadProducts(selected?.id)}>
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
          text="Можно импортировать файл OZON или добавить товар вручную через форму ниже."
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
            <div className="mb-4 text-lg font-semibold text-white">Добавить товар вручную</div>
            <ProductFormFields form={createForm} setForm={setCreateForm} />
            <div className="mt-4 flex justify-end">
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? 'Создаём...' : 'Добавить товар'}
              </Button>
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="text-lg font-semibold text-white">
                {selected ? 'Редактирование товара' : 'Выбери товар'}
              </div>
              {selected ? (
                <Button variant="danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Удаляем...' : 'Удалить товар'}
                </Button>
              ) : null}
            </div>

            {selected ? (
              <>
                <ProductFormFields form={editForm} setForm={setEditForm} />
                <div className="mt-4 flex justify-end">
                  <Button onClick={handleSave} disabled={saving || !selected}>
                    {saving ? 'Сохраняем...' : 'Сохранить'}
                  </Button>
                </div>
              </>
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

function ProductFormFields({
  form,
  setForm,
}: {
  form: ProductForm;
  setForm: React.Dispatch<React.SetStateAction<ProductForm>>;
}) {
  return (
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
    </div>
  );
}
