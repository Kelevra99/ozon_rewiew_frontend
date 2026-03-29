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

const TONE_PRESETS = ['friendly', 'neutral', 'business', 'expert', 'warm', 'premium'];

function emptyForm(): ProductForm {
  return {
    name: '',
    article: '',
    brand: '',
    model: '',
    kit: '',
    annotation: '',
    tonePreset: 'friendly',
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
    tonePreset: item?.tonePreset ?? 'friendly',
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

  const articleRaw = form.article.trim();
  if (!articleRaw) {
    throw new Error('Артикул товара обязателен');
  }

  const normalize = (value: string) => {
    const cleaned = value.trim();
    return cleaned.length ? cleaned : null;
  };

  return {
    name,
    article: articleRaw,
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        description="Здесь редактируются данные товара для генерации ответов на отзывы."
        actions={
          <Button variant="secondary" onClick={() => void loadProducts(selected?.id)}>
            Обновить
          </Button>
        }
      />

      <Card>
        <div className="space-y-2 text-sm text-slate-300">
          <div className="font-medium text-white">Как это работает</div>
          <div>
            Поле «Тон ответов» — это основной пользовательский prompt для ответов по этому товару. Если оно заполнено,
            именно оно отправляется в ИИ как главная инструкция.
          </div>
          <div>
            Если «Тон ответов» пустой, backend использует «Аннотацию» и «Специальные правила по товару» как контекст
            для генерации ответа.
          </div>
        </div>
      </Card>

      {errorText ? <ErrorAlert text={errorText} /> : null}
      {successText ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {successText}
        </div>
      ) : null}

      {!loading && !items.length ? (
        <EmptyState
          title="Товары пока не загружены"
          text="Можно импортировать файл OZON или воспользоваться отдельным подменю «Добавить товар»."
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
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Название товара" hint="Полное название карточки товара.">
          <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
        </Field>

        <Field label="Артикул" hint="Обязательное поле. По нему отзывы точнее связываются с карточкой товара.">
          <Input value={form.article} onChange={(e) => setForm((prev) => ({ ...prev, article: e.target.value }))} />
        </Field>

        <Field label="Бренд" hint="Короткое название бренда, если нужно использовать в ответах.">
          <Input value={form.brand} onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value }))} />
        </Field>

        <Field label="Модель" hint="Если у товара есть отдельное модельное обозначение.">
          <Input value={form.model} onChange={(e) => setForm((prev) => ({ ...prev, model: e.target.value }))} />
        </Field>

        <Field label="Комплектация" hint="Что входит в набор или поставку.">
          <Input value={form.kit} onChange={(e) => setForm((prev) => ({ ...prev, kit: e.target.value }))} />
        </Field>

        <Field label="Пресет тона" hint="Дополнительная настройка тона.">
          <select
            value={form.tonePreset}
            onChange={(e) => setForm((prev) => ({ ...prev, tonePreset: e.target.value }))}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none"
          >
            {TONE_PRESETS.map((preset) => (
              <option key={preset} value={preset}>
                {preset}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Название доп. поля 1" hint="Например: Инструменты, Совместимость, Материал.">
          <Input value={form.extra1Name} onChange={(e) => setForm((prev) => ({ ...prev, extra1Name: e.target.value }))} />
        </Field>

        <Field label="Значение доп. поля 1" hint="Полезное дополнительное свойство товара.">
          <Input value={form.extra1Value} onChange={(e) => setForm((prev) => ({ ...prev, extra1Value: e.target.value }))} />
        </Field>

        <Field label="Название доп. поля 2" hint="Ещё одно полезное свойство товара.">
          <Input value={form.extra2Name} onChange={(e) => setForm((prev) => ({ ...prev, extra2Name: e.target.value }))} />
        </Field>

        <Field label="Значение доп. поля 2" hint="Например: Вес, Размер, Количество функций.">
          <Input value={form.extra2Value} onChange={(e) => setForm((prev) => ({ ...prev, extra2Value: e.target.value }))} />
        </Field>
      </div>

      <Field
        label="Тон ответов"
        hint="Главный пользовательский prompt. Здесь можно коротко описать, кто отвечает на отзывы, в каком стиле, от лица бренда, магазина или просто продавца."
      >
        <Textarea value={form.toneNotes} onChange={(e) => setForm((prev) => ({ ...prev, toneNotes: e.target.value }))} />
      </Field>

      <Field
        label="Специальные правила по товару"
        hint="Особые ограничения, совместимость, типовые спорные ситуации и то, что можно или нельзя утверждать."
      >
        <Textarea value={form.productRules} onChange={(e) => setForm((prev) => ({ ...prev, productRules: e.target.value }))} />
      </Field>

      <Field
        label="Аннотация"
        hint="Описание товара. Используется как контекст, если поле «Тон ответов» не заполнено."
      >
        <Textarea value={form.annotation} onChange={(e) => setForm((prev) => ({ ...prev, annotation: e.target.value }))} />
      </Field>
    </div>
  );
}
