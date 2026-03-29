'use client';

import { useEffect, useMemo, useState } from 'react';
import type { GenerateProductContextResponse, ProductContextModeItem, ProductItem } from '@/types/api';
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
  replyContextShort: string;
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
    replyContextShort: '',
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
    replyContextShort: item?.replyContextShort ?? '',
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
    replyContextShort: normalize(form.replyContextShort),
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
  const [modes, setModes] = useState<ProductContextModeItem[]>([]);
  const [selectedMode, setSelectedMode] = useState<'standard' | 'advanced' | 'expert'>('advanced');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [generatingContext, setGeneratingContext] = useState(false);
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

  async function loadModes() {
    try {
      const response = await apiFetch<unknown>('/products/context-modes', {
        method: 'GET',
        auth: true,
      });

      const list = toArray<ProductContextModeItem>(response);
      setModes(list);

      const hasSelected = list.some((item) => item.code === selectedMode);
      if (!hasSelected && list[0]) {
        setSelectedMode(list[0].code);
      }
    } catch (error) {
      console.warn('Не удалось загрузить уровни генерации контекста', error);
      setModes([
        { code: 'standard', title: 'Standard', openAiModel: '' },
        { code: 'advanced', title: 'Advanced', openAiModel: '' },
        { code: 'expert', title: 'Expert', openAiModel: '' },
      ]);
    }
  }

  useEffect(() => {
    void loadProducts();
    void loadModes();
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

  async function handleGenerateContext() {
    if (!selected?.id) return;

    setGeneratingContext(true);
    setErrorText('');
    setSuccessText('');

    try {
      const result = await apiFetch<GenerateProductContextResponse>(`/products/${selected.id}/reply-context/generate`, {
        method: 'POST',
        auth: true,
        body: JSON.stringify({ mode: selectedMode }),
      });

      setEditForm((prev) => ({
        ...prev,
        replyContextShort: result.replyContextShort,
      }));

      setSuccessText(
        `Компактный контекст собран. Режим: ${result.mode}, модель: ${result.model}. Не забудь сохранить товар.`,
      );
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось собрать компактный контекст');
    } finally {
      setGeneratingContext(false);
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
        description="Здесь редактируются исходные данные товара и компактный контекст, который потом используется для генерации ответов на отзывы."
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
            Поля «Аннотация», «Тон ответов» и «Специальные правила» можно заполнять подробно. Чтобы не отправлять весь
            этот объём в каждый отзыв, можно собрать отдельный компактный контекст одной кнопкой.
          </div>
          <div>
            Компактный контекст можно и редактировать вручную. Если он заполнен, именно он будет использоваться в
            генерации ответа вместо длинных исходных блоков.
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
          <div className="border-b border-white/10 px-5 py-4 text-sm font-medium text-white">Список товаров</div>
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
                <ProductFormFields
                  form={editForm}
                  setForm={setEditForm}
                  modes={modes}
                  selectedMode={selectedMode}
                  setSelectedMode={setSelectedMode}
                  onGenerateContext={handleGenerateContext}
                  generatingContext={generatingContext}
                />
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
  modes,
  selectedMode,
  setSelectedMode,
  onGenerateContext,
  generatingContext,
}: {
  form: ProductForm;
  setForm: React.Dispatch<React.SetStateAction<ProductForm>>;
  modes: ProductContextModeItem[];
  selectedMode: 'standard' | 'advanced' | 'expert';
  setSelectedMode: React.Dispatch<React.SetStateAction<'standard' | 'advanced' | 'expert'>>;
  onGenerateContext: () => void;
  generatingContext: boolean;
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

        <Field label="Пресет тона" hint="Базовый тон ответов для этого товара.">
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

        <Field label="Название доп. поля 1" hint="Например: Инструменты, Материал, Совместимость.">
          <Input value={form.extra1Name} onChange={(e) => setForm((prev) => ({ ...prev, extra1Name: e.target.value }))} />
        </Field>

        <Field label="Значение доп. поля 1" hint="Полезное дополнительное свойство товара.">
          <Input value={form.extra1Value} onChange={(e) => setForm((prev) => ({ ...prev, extra1Value: e.target.value }))} />
        </Field>

        <Field label="Название доп. поля 2" hint="Ещё одно дополнительное свойство товара.">
          <Input value={form.extra2Name} onChange={(e) => setForm((prev) => ({ ...prev, extra2Name: e.target.value }))} />
        </Field>

        <Field label="Значение доп. поля 2" hint="Например: Вес, Размер, Количество функций.">
          <Input value={form.extra2Value} onChange={(e) => setForm((prev) => ({ ...prev, extra2Value: e.target.value }))} />
        </Field>
      </div>

      <div className="space-y-4">
        <Field
          label="Аннотация"
          hint="Подробное описание товара. Можно хранить полную версию, даже если она длинная."
        >
          <Textarea value={form.annotation} onChange={(e) => setForm((prev) => ({ ...prev, annotation: e.target.value }))} />
        </Field>

        <Field
          label="Тон ответов"
          hint="Подробные правила по стилю: как звучать, чего избегать, как отвечать на разные оценки."
        >
          <Textarea value={form.toneNotes} onChange={(e) => setForm((prev) => ({ ...prev, toneNotes: e.target.value }))} />
        </Field>

        <Field
          label="Специальные правила по товару"
          hint="Особые ограничения, совместимость, типовые спорные ситуации и допустимые акценты в ответах."
        >
          <Textarea value={form.productRules} onChange={(e) => setForm((prev) => ({ ...prev, productRules: e.target.value }))} />
        </Field>
      </div>

      <Card>
        <div className="space-y-4">
          <div>
            <div className="text-base font-semibold text-white">Компактный контекст для отзывов</div>
            <div className="mt-1 text-sm text-slate-400">
              Это короткий рабочий контекст для ИИ. Его можно написать вручную или собрать автоматически из полных
              данных товара. Именно его выгоднее отправлять в генерацию ответов на отзывы.
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_auto]">
            <Field label="Уровень генерации" hint="Выбери один из трёх уровней. Модель и цены для него берутся из базы.">
              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value as 'standard' | 'advanced' | 'expert')}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none"
              >
                {modes.map((mode) => (
                  <option key={mode.code} value={mode.code}>
                    {mode.title} {mode.openAiModel ? `— ${mode.openAiModel}` : ''}
                  </option>
                ))}
              </select>
            </Field>

            <div className="md:col-span-2 flex items-end">
              <Button onClick={onGenerateContext} disabled={generatingContext}>
                {generatingContext ? 'Собираем...' : 'Собрать компактный контекст'}
              </Button>
            </div>
          </div>

          <Field
            label="Компактный контекст"
            hint="Можно отредактировать вручную. Если поле заполнено, генерация отзывов будет использовать именно его вместо длинных исходных блоков."
          >
            <Textarea
              value={form.replyContextShort}
              onChange={(e) => setForm((prev) => ({ ...prev, replyContextShort: e.target.value }))}
            />
          </Field>
        </div>
      </Card>
    </div>
  );
}
