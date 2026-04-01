'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Dispatch, MouseEvent as ReactMouseEvent, SetStateAction } from 'react';
import type { ProductItem } from '@/types/api';
import { apiFetch } from '@/lib/api-client';
import { toArray } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorAlert } from '@/components/ui/error-alert';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type ProductForm = {
  name: string;
  article: string;
  brand: string;
  model: string;
  kit: string;
  annotation: string;
  productRules: string;
  extra1Name: string;
  extra1Value: string;
  extra2Name: string;
  extra2Value: string;
};

type BulkForm = {
  brand: string;
  model: string;
  productRules: string;
  annotation: string;
};

type BulkFieldKey = keyof BulkForm;

type AnnotationShorteningResponse = {
  logId: string;
  shortenedAnnotation: string;
  chargedMinor: number;
  chargedRub: number;
  balanceAfterMinor: number;
  balanceAfterRub: number;
};

type BulkMutationResponse = {
  ok: boolean;
  updatedCount?: number;
  deletedCount?: number;
  productIds?: string[];
};

function emptyForm(): ProductForm {
  return {
    name: '',
    article: '',
    brand: '',
    model: '',
    kit: '',
    annotation: '',
    productRules: '',
    extra1Name: '',
    extra1Value: '',
    extra2Name: '',
    extra2Value: '',
  };
}

function emptyBulkForm(): BulkForm {
  return {
    brand: '',
    model: '',
    productRules: '',
    annotation: '',
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
    productRules: normalize(form.productRules),
    extra1Name: normalize(form.extra1Name),
    extra1Value: normalize(form.extra1Value),
    extra2Name: normalize(form.extra2Name),
    extra2Value: normalize(form.extra2Value),
  };
}

function normalizeNullable(value: string) {
  const cleaned = value.trim();
  return cleaned.length ? cleaned : null;
}

function normalizeSearch(value: string | null | undefined) {
  return (value ?? '').trim().toLowerCase();
}

function formatRubShort(value: number): string {
  const roundedUp = Math.ceil(value * 100) / 100;
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(roundedUp);
}

function RefreshIcon({ spinning = false }: { spinning?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-5 w-5 ${spinning ? 'animate-spin' : ''}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

export default function ProductsPage() {
  const [items, setItems] = useState<ProductItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [singleForm, setSingleForm] = useState<ProductForm>(emptyForm());
  const [bulkForm, setBulkForm] = useState<BulkForm>(emptyBulkForm());
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bulkSavingField, setBulkSavingField] = useState<BulkFieldKey | null>(null);
  const [shortening, setShortening] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');
  const [annotationShorteningLogId, setAnnotationShorteningLogId] = useState<string | null>(null);
  const [linkedPanelHeight, setLinkedPanelHeight] = useState<number | null>(null);

  const editPanelRef = useRef<HTMLDivElement | null>(null);
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const pendingScrollTopRef = useRef<number | null>(null);

  const bulkSelectionActive = multiSelectMode || selectedIds.length > 1;
  const showCheckboxes = multiSelectMode || selectedIds.length > 1;

  const selected = useMemo(() => {
    const firstId = selectedIds[0];
    if (!firstId) return null;
    return items.find((item) => item.id === firstId) ?? null;
  }, [items, selectedIds]);

  async function loadProducts(preferredIds?: string[]) {
    setLoading(true);
    setErrorText('');

    try {
      const response = await apiFetch<unknown>('/products', {
        method: 'GET',
        auth: true,
      });

      const list = toArray<ProductItem>(response);
      setItems(list);

      requestAnimationFrame(() => {
        if (listContainerRef.current && pendingScrollTopRef.current !== null) {
          listContainerRef.current.scrollTop = pendingScrollTopRef.current;
          pendingScrollTopRef.current = null;
        }
      });

      const requestedIds = preferredIds ?? selectedIds;
      const nextSelectedIds = requestedIds.length
        ? list.filter((item) => requestedIds.includes(item.id)).map((item) => item.id)
        : [];

      const fallbackIds = nextSelectedIds.length ? nextSelectedIds : list[0] ? [list[0].id] : [];
      setSelectedIds(fallbackIds);

      const nextSelectedItem = fallbackIds.length
        ? list.find((item) => item.id === fallbackIds[0]) ?? null
        : null;

      setSingleForm(toForm(nextSelectedItem));
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
    if (!bulkSelectionActive) {
      setSingleForm(toForm(selected));
    }
  }, [selected, bulkSelectionActive]);

  useEffect(() => {
    const element = editPanelRef.current;
    if (!element) return;

    const syncHeight = () => {
      if (window.innerWidth >= 1280) {
        setLinkedPanelHeight(element.getBoundingClientRect().height);
      } else {
        setLinkedPanelHeight(null);
      }
    };

    syncHeight();

    const observer = new ResizeObserver(() => {
      syncHeight();
    });

    observer.observe(element);
    window.addEventListener('resize', syncHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', syncHeight);
    };
  }, [bulkSelectionActive, selected, items.length]);

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
    if (bulkSelectionActive) return;
    if (!filteredItems.length) return;

    if (!selected || !filteredItems.some((item) => item.id === selected.id)) {
      setSelectedIds([filteredItems[0].id]);
    }
  }, [filteredItems, selected, bulkSelectionActive]);

  function resetMessages() {
    setErrorText('');
    setSuccessText('');
    setAnnotationShorteningLogId(null);
  }

  function toggleSelectedId(itemId: string, forceChecked?: boolean) {
    setSelectedIds((prev) => {
      const exists = prev.includes(itemId);

      if (forceChecked === true && exists) return prev;
      if (forceChecked === false && !exists) return prev;

      if (forceChecked === true) return [...prev, itemId];
      if (forceChecked === false) return prev.filter((id) => id !== itemId);

      return exists ? prev.filter((id) => id !== itemId) : [...prev, itemId];
    });
  }

  function handleItemClick(item: ProductItem, event: ReactMouseEvent<HTMLButtonElement>) {
    resetMessages();

    const withModifier = event.ctrlKey || event.metaKey;

    if (multiSelectMode) {
      toggleSelectedId(item.id);
      return;
    }

    if (withModifier) {
      if (selectedIds.length <= 1 && !selectedIds.includes(item.id)) {
        setBulkForm(emptyBulkForm());
      }
      toggleSelectedId(item.id);
      return;
    }

    setMultiSelectMode(false);
    setBulkForm(emptyBulkForm());
    setSelectedIds([item.id]);
  }

  function handleToggleMultiSelectMode() {
    resetMessages();

    if (bulkSelectionActive) {
      setMultiSelectMode(false);
      setBulkForm(emptyBulkForm());
      setSelectedIds((prev) => {
        if (prev.length) return [prev[0]];
        return items[0] ? [items[0].id] : [];
      });
      return;
    }

    setMultiSelectMode(true);
    setBulkForm(emptyBulkForm());
    setSelectedIds((prev) => {
      if (prev.length) return prev;
      return items[0] ? [items[0].id] : [];
    });
  }

  async function handleSave() {
    if (!selected?.id) return;

    setSaving(true);
    resetMessages();

    try {
      const updated = await apiFetch<ProductItem>(`/products/${selected.id}`, {
        method: 'PATCH',
        auth: true,
        body: JSON.stringify(normalizePayload(singleForm)),
      });

      setItems((prev) =>
        prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)),
      );
      setSelectedIds([updated.id]);
      setSingleForm(toForm(updated));
      setSuccessText('Товар обновлён');
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось обновить товар');
    } finally {
      setSaving(false);
    }
  }

  async function handleBulkSave(field: BulkFieldKey) {
    if (!selectedIds.length) return;

    setBulkSavingField(field);
    resetMessages();

    try {
      const payload = {
        productIds: selectedIds,
        [field]: normalizeNullable(bulkForm[field]),
      };

      const result = await apiFetch<BulkMutationResponse>('/products/bulk', {
        method: 'PATCH',
        auth: true,
        body: JSON.stringify(payload),
      });

      await loadProducts(selectedIds);

      const fieldTitle: Record<BulkFieldKey, string> = {
        brand: 'Бренд',
        model: 'Модель',
        productRules: 'Специальные правила по товару',
        annotation: 'Аннотация',
      };

      setSuccessText(
        `${fieldTitle[field]} обновлён${result.updatedCount && result.updatedCount > 1 ? 'ы' : ''} у ${
          result.updatedCount ?? selectedIds.length
        } товар${(result.updatedCount ?? selectedIds.length) === 1 ? 'а' : 'ов'}.`,
      );
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось массово обновить товары');
    } finally {
      setBulkSavingField(null);
    }
  }

  async function handleShortenAnnotation() {
    if (!selected?.id) return;

    if (!singleForm.annotation.trim()) {
      setErrorText('Описание товара пустое, сокращать нечего');
      setSuccessText('');
      setAnnotationShorteningLogId(null);
      return;
    }

    setShortening(true);
    resetMessages();

    try {
      const result = await apiFetch<AnnotationShorteningResponse>(
        `/products/${selected.id}/annotation-shorten`,
        {
          method: 'POST',
          auth: true,
        },
      );

      const nextAnnotation = result.shortenedAnnotation || singleForm.annotation;

      setSingleForm((prev) => ({
        ...prev,
        annotation: nextAnnotation,
      }));

      setItems((prev) =>
        prev.map((item) =>
          item.id === selected.id ? { ...item, annotation: nextAnnotation } : item,
        ),
      );

      setAnnotationShorteningLogId(result.logId);
      setSuccessText(
        `Описание сокращено. За сокращение описания списано ${formatRubShort(result.chargedRub)}.`,
      );
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось сократить описание');
    } finally {
      setShortening(false);
    }
  }

  async function handleDelete() {
    const deleteCount = bulkSelectionActive ? selectedIds.length : selected ? 1 : 0;
    if (!deleteCount) return;

    const confirmText = bulkSelectionActive
      ? `Удалить выбранные товары (${deleteCount})?`
      : `Удалить товар "${selected?.name}"?`;

    const ok = window.confirm(confirmText);
    if (!ok) return;

    setDeleting(true);
    resetMessages();

    try {
      if (bulkSelectionActive) {
        await apiFetch<BulkMutationResponse>('/products/bulk', {
          method: 'DELETE',
          auth: true,
          body: JSON.stringify({ productIds: selectedIds }),
        });

        setMultiSelectMode(false);
        setBulkForm(emptyBulkForm());
        await loadProducts([]);
        setSuccessText(`Удалено товаров: ${deleteCount}`);
      } else if (selected?.id) {
        await apiFetch(`/products/${selected.id}`, {
          method: 'DELETE',
          auth: true,
        });

        await loadProducts([]);
        setSuccessText('Товар удалён');
      }
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось удалить товар');
    } finally {
      setDeleting(false);
    }
  }

  const deleteButtonText = bulkSelectionActive
    ? deleting
      ? 'Удаляем...'
      : selectedIds.length
        ? `Удалить выбранные (${selectedIds.length})`
        : 'Удалить выбранные'
    : deleting
      ? 'Удаляем...'
      : 'Удалить товар';

  return (
    <div className="space-y-6">
      {errorText ? <ErrorAlert text={errorText} /> : null}

      {successText ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          <div>{successText}</div>
          {annotationShorteningLogId && !bulkSelectionActive ? (
            <div className="mt-3">
              <Link
                href={`/products/annotation-shortenings/${annotationShorteningLogId}`}
                className="inline-flex items-center justify-center rounded-2xl border border-emerald-300/30 bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-50 transition hover:bg-emerald-500/20"
              >
                Открыть сокращение
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}

      <Card>
        <div className="space-y-4 text-sm leading-6 text-slate-300">
          <div className="text-lg font-semibold text-white">Как это работает</div>

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

      {!loading && !items.length ? (
        <EmptyState
          title="Товары пока не загружены"
          text="Можно импортировать файл OZON или воспользоваться отдельным подменю «Добавить товар»."
        />
      ) : null}

      <div className="grid items-start gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div
          className="min-h-0"
          style={linkedPanelHeight ? { height: `${linkedPanelHeight}px` } : undefined}
        >
          <Card className="flex h-full min-h-0 flex-col p-0">
            <div className="border-b border-white/10 px-5 py-4">
              <div className="flex min-h-[44px] items-center justify-between gap-3">
                <div className="text-lg font-semibold text-white">Список товаров</div>

                <button
                  type="button"
                  onClick={() => void loadProducts(selectedIds)}
                  disabled={loading}
                  title="Обновить список товаров"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshIcon spinning={loading} />
                </button>
              </div>

              <div className="mt-4">
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Поиск по названию или артикулу"
                />
              </div>

              <div className="mt-4">
                <Button onClick={handleToggleMultiSelectMode} className="w-full justify-center">
                  {bulkSelectionActive ? 'Обычный режим' : 'Выбрать несколько'}
                </Button>
              </div>
            </div>

            <div ref={listContainerRef} className="flex-1 min-h-0 overflow-auto p-3">
              {loading ? (
                <div className="p-4 text-sm text-slate-400">Загрузка товаров...</div>
              ) : filteredItems.length ? (
                <div className="space-y-2">
                  {filteredItems.map((item) => {
                    const active = selectedIds.includes(item.id);

                    return (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 rounded-2xl border px-3 py-3 transition ${
                          active
                            ? 'border-amber-300/50 bg-amber-300/10'
                            : 'border-white/10 bg-slate-950/30 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex w-6 shrink-0 items-center justify-center">
                          {showCheckboxes ? (
                            <input
                              type="checkbox"
                              checked={active}
                              onChange={(e) => toggleSelectedId(item.id, e.target.checked)}
                              className="h-4 w-4 accent-amber-300"
                              aria-label={`Выбрать товар ${item.name}`}
                            />
                          ) : (
                            <span className="h-4 w-4 opacity-0" />
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(event) => handleItemClick(item, event)}
                          className="flex-1 text-left"
                        >
                          <div className="font-medium text-white">{item.name || 'Без названия'}</div>
                          <div className="mt-1 text-xs text-slate-400">
                            {item.article || 'Без артикула'} · {item.brand || 'Без бренда'}
                          </div>
                        </button>
                      </div>
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
        </div>

        <div ref={editPanelRef}>
          <Card>
            <div className="mb-4 flex min-h-[44px] items-center justify-between gap-3">
              <div className="text-lg font-semibold text-white">
                {bulkSelectionActive
                  ? 'Массовое изменение товаров'
                  : selected
                    ? 'Редактирование товара'
                    : 'Выберите товар'}
              </div>

              {(selected || bulkSelectionActive) ? (
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  disabled={deleting || !selectedIds.length}
                >
                  {deleteButtonText}
                </Button>
              ) : null}
            </div>

            {bulkSelectionActive ? (
              <BulkProductEditor
                selectedCount={selectedIds.length}
                form={bulkForm}
                setForm={setBulkForm}
                savingField={bulkSavingField}
                onSaveField={handleBulkSave}
              />
            ) : selected ? (
              <>
                <ProductFormFields form={singleForm} setForm={setSingleForm} />

                <div className="mt-4 flex flex-wrap justify-end gap-3">
                  <Button
                    variant="secondary"
                    onClick={handleShortenAnnotation}
                    disabled={shortening || saving || !selected || !singleForm.annotation.trim()}
                  >
                    {shortening ? 'Сокращаем...' : 'Сократить описание'}
                  </Button>

                  <Button onClick={handleSave} disabled={saving || shortening || !selected}>
                    {saving ? 'Сохраняем...' : 'Сохранить'}
                  </Button>
                </div>
              </>
            ) : (
              <EmptyState title="Нет выбранного товара" />
            )}
          </Card>
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
  setForm: Dispatch<SetStateAction<ProductForm>>;
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

function BulkProductEditor({
  selectedCount,
  form,
  setForm,
  savingField,
  onSaveField,
}: {
  selectedCount: number;
  form: BulkForm;
  setForm: Dispatch<SetStateAction<BulkForm>>;
  savingField: BulkFieldKey | null;
  onSaveField: (field: BulkFieldKey) => void;
}) {
  const busy = savingField !== null;
  const disabled = selectedCount === 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3 text-sm leading-6 text-slate-300">
        {selectedCount ? (
          <>
            Выбрано товаров: <span className="font-semibold text-white">{selectedCount}</span>. Заполняйте
            только то поле, которое хотите массово поменять, и сохраняйте его отдельно.
          </>
        ) : (
          'Сначала выделите один или несколько товаров слева.'
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <BulkInlineField
          label="Бренд"
          hint="Массовое изменение бренда у выбранных товаров."
          value={form.brand}
          onChange={(value) => setForm((prev) => ({ ...prev, brand: value }))}
          onSave={() => onSaveField('brand')}
          buttonText={savingField === 'brand' ? 'Сохраняем...' : 'Сохранить бренд'}
          disabled={disabled || busy}
        />

        <BulkInlineField
          label="Модель"
          hint="Массовое изменение модели у выбранных товаров."
          value={form.model}
          onChange={(value) => setForm((prev) => ({ ...prev, model: value }))}
          onSave={() => onSaveField('model')}
          buttonText={savingField === 'model' ? 'Сохраняем...' : 'Сохранить модель'}
          disabled={disabled || busy}
        />
      </div>

      <Field
        label="Специальные правила по товару"
        hint="Это поле сохранится сразу у всех выделенных товаров."
      >
        <Textarea
          className="min-h-[220px]"
          value={form.productRules}
          onChange={(e) => setForm((prev) => ({ ...prev, productRules: e.target.value }))}
        />
      </Field>

      <div className="flex justify-end">
        <Button
          onClick={() => onSaveField('productRules')}
          disabled={disabled || busy}
        >
          {savingField === 'productRules' ? 'Сохраняем...' : 'Сохранить специальные правила'}
        </Button>
      </div>

      <Field
        label="Аннотация"
        hint="Это поле сохранится сразу у всех выделенных товаров."
      >
        <Textarea
          className="min-h-[220px]"
          value={form.annotation}
          onChange={(e) => setForm((prev) => ({ ...prev, annotation: e.target.value }))}
        />
      </Field>

      <div className="flex justify-end">
        <Button
          onClick={() => onSaveField('annotation')}
          disabled={disabled || busy}
        >
          {savingField === 'annotation' ? 'Сохраняем...' : 'Сохранить аннотацию'}
        </Button>
      </div>
    </div>
  );
}

function BulkInlineField({
  label,
  hint,
  value,
  onChange,
  onSave,
  buttonText,
  disabled,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  buttonText: string;
  disabled: boolean;
}) {
  return (
    <Field label={label} hint={hint}>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <Input value={value} onChange={(e) => onChange(e.target.value)} />
        <Button onClick={onSave} disabled={disabled} className="whitespace-nowrap">
          {buttonText}
        </Button>
      </div>
    </Field>
  );
}
