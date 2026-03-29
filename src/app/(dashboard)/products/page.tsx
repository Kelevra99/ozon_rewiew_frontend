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

function normalizeSearch(value: string | null | undefined) {
  return (value ?? '').trim().toLowerCase();
}

export default function ProductsPage() {
  const [items, setItems] = useState<ProductItem[]>([]);
  const [selected, setSelected] = useState<ProductItem | null>(null);
  const [editForm, setEditForm] = useState<ProductForm>(emptyForm());
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredItems = useMemo(() => {
    const query = normalizeSearch(searchTerm);
    if (!query) return items;

    return items.filter((item) => {
      const name = normalizeSearch(item.name);
      const article = normalizeSearch(item.article);
      return name.startsWith(query) || article.startsWith(query);
    });
  }, [items, searchTerm]);

  useEffect(() => {
    if (!filteredItems.length) return;

    if (!selected || !filteredItems.some((item) => item.id === selected.id)) {
      setSelected(filteredItems[0]);
    }
  }, [filteredItems, selected]);

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
        description="Здесь редактируются данные товара, которые используются при генерации ответов на отзывы."
        actions={
          <Button variant="secondary" onClick={() => void loadProducts(selected?.id)}>
            Обновить
          </Button>
        }
      />

      <Card>
        <div className="space-y-4 text-sm leading-6 text-slate-300">
          <div className="text-lg font-semibold text-white">Как это работает</div>

          <p>
            <span className="font-medium text-white">Тон ответов</span> задаёт общий стиль и логику ответа.
            Здесь можно описать, от чьего лица писать, каким должен быть тон, насколько кратко или подробно
            отвечать, как вести себя в спорных ситуациях и какой в целом должна быть манера общения с покупателем.
            Это базовая инструкция, с которой начинается генерация ответа.
          </p>

          <p>
            <span className="font-medium text-white">Специальные правила по товару</span> нужны для уточнений
            по конкретной карточке. Здесь удобно прописывать частые проблемы, важные ограничения, совместимость,
            типовые вопросы покупателей, а также то, что можно подчеркивать в ответах и чего нельзя обещать
            или утверждать.
          </p>

          <p>
            <span className="font-medium text-white">Аннотация</span> — это краткая рабочая выжимка о товаре.
            Сюда лучше вносить только ту информацию, которая действительно помогает отвечать на отзывы:
            ключевые характеристики, особенности использования, важные ограничения и отличия. Лишняя рекламная
            информация здесь не нужна.
          </p>

          <p>
            В запрос к ИИ уходит вся информация с этой страницы. Поэтому поля стоит заполнять максимально полезно,
            но без лишней воды: чем больше текста отправляется в обработку, тем дороже становится запрос.
            Можно тестировать разные варианты и подбирать баланс между полнотой описания и более короткими,
            экономичными формулировками.
          </p>
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

      <div className="grid items-start gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="flex min-h-0 flex-col p-0 xl:h-[calc(100vh-260px)] xl:max-h-[920px]">
          <div className="border-b border-white/10 px-5 py-4">
            <div className="text-lg font-semibold text-white">Список товаров</div>
            <div className="mt-4">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Поиск по названию или артикулу"
              />
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-auto p-3">
            {loading ? (
              <div className="p-4 text-sm text-slate-400">Загрузка товаров...</div>
            ) : filteredItems.length ? (
              <div className="space-y-2">
                {filteredItems.map((item) => {
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
            ) : (
              <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-6 text-sm text-slate-400">
                По вашему запросу товары не найдены.
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="text-lg font-semibold text-white">
              {selected ? 'Редактирование товара' : 'Выберите товар'}
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
      </div>

      {selectedDetails ? (
        <Card>
          <JsonBlock title="Raw JSON выбранного товара" data={selectedDetails} />
        </Card>
      ) : null}
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
        hint="Основная инструкция для генерации. Здесь можно задать общий стиль ответов, тон общения, роль продавца и базовые правила поведения в ответах."
      >
        <Textarea value={form.toneNotes} onChange={(e) => setForm((prev) => ({ ...prev, toneNotes: e.target.value }))} />
      </Field>

      <Field
        label="Специальные правила по товару"
        hint="Уточнения по конкретному товару: совместимость, ограничения, частые вопросы, типовые проблемы и важные нюансы для ответов."
      >
        <Textarea value={form.productRules} onChange={(e) => setForm((prev) => ({ ...prev, productRules: e.target.value }))} />
      </Field>

      <Field
        label="Аннотация"
        hint="Краткое описание товара для контекста ответа. Лучше оставить только важные факты, которые реально помогают при работе с отзывами."
      >
        <Textarea value={form.annotation} onChange={(e) => setForm((prev) => ({ ...prev, annotation: e.target.value }))} />
      </Field>
    </div>
  );
}
