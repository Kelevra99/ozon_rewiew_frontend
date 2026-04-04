'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  ManualReplyGenerateResponse,
  ManualReplyPreviewResponse,
  ProductItem,
} from '@/types/api';
import { apiFetch } from '@/lib/api-client';
import { toArray } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorAlert } from '@/components/ui/error-alert';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { Textarea } from '@/components/ui/textarea';

type ModeCode = 'standard' | 'advanced' | 'expert';

const MODE_OPTIONS: Array<{ code: ModeCode; label: string }> = [
  { code: 'standard', label: 'Стандарт' },
  { code: 'advanced', label: 'Умный' },
  { code: 'expert', label: 'Эксперт' },
];

function formatRub(value?: number | null) {
  const numeric = Number(value ?? 0);

  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= value;

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border text-2xl transition ${
              active
                ? 'border-amber-300/40 bg-amber-300/10 text-amber-200'
                : 'border-white/10 bg-white/5 text-slate-500 hover:bg-white/10'
            }`}
            aria-label={`Поставить ${star} ${star === 1 ? 'звезду' : star < 5 ? 'звезды' : 'звёзд'}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

export default function ManualReplyPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [mode, setMode] = useState<ModeCode>('expert');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');
  const [preview, setPreview] = useState<ManualReplyPreviewResponse | null>(null);
  const [result, setResult] = useState<ManualReplyGenerateResponse | null>(null);
  const [linkedPanelHeight, setLinkedPanelHeight] = useState<number | null>(null);

  const rightColumnRef = useRef<HTMLDivElement | null>(null);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return products;

    return products.filter((item) => {
      const name = (item.name ?? '').toLowerCase();
      const article = (item.article ?? '').toLowerCase();
      return name.includes(query) || article.includes(query);
    });
  }, [products, searchTerm]);

  const selectedProduct = useMemo(
    () => products.find((item) => item.id === selectedProductId) ?? null,
    [products, selectedProductId],
  );

  async function loadProducts() {
    setLoadingProducts(true);
    setErrorText('');

    try {
      const response = await apiFetch<unknown>('/products', {
        method: 'GET',
        auth: true,
      });

      const list = toArray<ProductItem>(response);
      setProducts(list);

      if (!selectedProductId && list.length) {
        setSelectedProductId(list[0].id);
      } else if (selectedProductId && !list.some((item) => item.id === selectedProductId)) {
        setSelectedProductId(list[0]?.id ?? '');
      }
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось загрузить товары');
    } finally {
      setLoadingProducts(false);
    }
  }

  async function handleGenerate() {
    if (!selectedProductId) {
      setErrorText('Сначала выберите товар слева');
      return;
    }

    setGenerateLoading(true);
    setErrorText('');
    setSuccessText('');

    try {
      const response = await apiFetch<ManualReplyGenerateResponse>('/replies/manual/generate', {
        method: 'POST',
        auth: true,
        body: JSON.stringify({
          productId: selectedProductId,
          rating,
          reviewText,
          mode,
        }),
      });

      setResult(response);
      setSuccessText('Ответ успешно сгенерирован.');
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось сгенерировать ответ');
    } finally {
      setGenerateLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  useEffect(() => {
    const element = rightColumnRef.current;
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
  }, [previewLoading, generateLoading, preview, result, products.length, selectedProductId, rating, reviewText, mode]);

  useEffect(() => {
    if (!selectedProductId) {
      setPreview(null);
      return;
    }

    setResult(null);
    setSuccessText('');
    setErrorText('');

    let cancelled = false;

    const timer = window.setTimeout(async () => {
      setPreviewLoading(true);

      try {
        const response = await apiFetch<ManualReplyPreviewResponse>('/replies/manual/preview', {
          method: 'POST',
          auth: true,
          body: JSON.stringify({
            productId: selectedProductId,
            rating,
            reviewText,
            mode,
          }),
        });

        if (!cancelled) {
          setPreview(response);
        }
      } catch (error) {
        if (!cancelled) {
          setPreview(null);
          setErrorText(error instanceof Error ? error.message : 'Не удалось собрать промт');
        }
      } finally {
        if (!cancelled) {
          setPreviewLoading(false);
        }
      }
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [selectedProductId, rating, reviewText, mode]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ручная генерация"
        description="Тестовый ручной режим на том же боевом пайплайне: выбираете товар, задаёте оценку и отзыв, итоговый промт собирается автоматически, а генерация запускается с реальным списанием стоимости."
      />

      {errorText ? <ErrorAlert text={errorText} /> : null}

      {successText ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {successText}
        </div>
      ) : null}

      {!loadingProducts && !products.length ? (
        <EmptyState
          title="Товары пока не загружены"
          text="Сначала загрузите или создайте хотя бы один товар, а потом можно тестировать ручную генерацию."
        />
      ) : null}

      <div className="grid items-start gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div
          className="min-h-0"
          style={linkedPanelHeight ? { height: `${linkedPanelHeight}px` } : undefined}
        >
          <Card className="flex h-full min-h-0 flex-col p-0">
            <div className="border-b border-white/10 px-5 py-4">
              <div className="text-lg font-semibold text-white">Список товаров</div>

              <div className="mt-4">
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Поиск по названию или артикулу"
                />
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-auto p-3">
              {loadingProducts ? (
                <div className="p-4 text-sm text-slate-400">Загрузка товаров...</div>
              ) : filteredProducts.length ? (
                <div className="space-y-2">
                  {filteredProducts.map((item) => {
                    const active = item.id === selectedProductId;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedProductId(item.id);
                        }}
                        className={`block w-full rounded-2xl border px-4 py-3 text-left transition ${
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
        </div>

        <div ref={rightColumnRef} className="space-y-6">
          <Card>
            <div className="space-y-6">
              <div>
                <div className="text-lg font-semibold text-white">Данные для генерации</div>
                <div className="mt-2 text-sm leading-6 text-slate-300">
                  Выбранный товар:{' '}
                  <span className="font-medium text-white">
                    {selectedProduct ? selectedProduct.name : 'не выбран'}
                  </span>
                  {selectedProduct?.article ? (
                    <span className="text-slate-400"> · {selectedProduct.article}</span>
                  ) : null}
                </div>
              </div>

              <div>
                <div className="mb-3 text-sm font-medium text-slate-200">Оценка</div>
                <StarRating value={rating} onChange={setRating} />
                <div className="mt-2 text-xs text-slate-400">Выбрано: {rating} из 5</div>
              </div>

              <div>
                <div className="mb-3 text-sm font-medium text-slate-200">Отзыв</div>
                <Textarea
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                  placeholder="Введите текст отзыва"
                  className="min-h-[180px]"
                />
              </div>

              <div>
                <div className="mb-3 text-sm font-medium text-slate-200">Уровень модели</div>
                <select
                  value={mode}
                  onChange={(event) => setMode(event.target.value as ModeCode)}
                  className="h-[46px] w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white outline-none transition focus:border-amber-300/40 focus:ring-2 focus:ring-amber-300/20"
                >
                  {MODE_OPTIONS.map((item) => (
                    <option key={item.code} value={item.code} className="bg-slate-950 text-white">
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => void handleGenerate()}
                  disabled={generateLoading || previewLoading || !selectedProductId}
                >
                  {generateLoading
                    ? 'Генерируем...'
                    : previewLoading
                      ? 'Обновляем промт...'
                      : 'Сгенерировать ответ'}
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-lg font-semibold text-white">Итоговый промт</div>
                <div className="text-xs text-slate-400">
                  {previewLoading ? 'Обновляется автоматически...' : 'Обновляется автоматически'}
                </div>
              </div>

              <Textarea
                value={preview?.fullPrompt ?? ''}
                readOnly
                spellCheck={false}
                placeholder="Промт собирается автоматически при выборе товара, смене оценки, текста отзыва или режима модели."
                className="min-h-[320px] resize-y overflow-y-auto leading-6"
              />

              {preview?.selectedProduct ? (
                <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3 text-sm text-slate-300">
                  Товар в промте: <span className="font-medium text-white">{preview.selectedProduct.name}</span>
                  {preview.selectedProduct.article ? (
                    <span className="text-slate-400"> · {preview.selectedProduct.article}</span>
                  ) : null}
                </div>
              ) : null}
            </div>
          </Card>

          <Card>
            <div className="space-y-4">
              <div className="text-lg font-semibold text-white">Результат генерации</div>

              <Textarea
                value={result?.generatedReply ?? ''}
                readOnly
                spellCheck={false}
                placeholder="После генерации здесь появится готовый ответ."
                className="min-h-[220px] resize-y overflow-y-auto leading-6"
              />

              {result ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Модель</div>
                    <div className="mt-2 text-sm font-medium text-white">{result.model}</div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Токены</div>
                    <div className="mt-2 text-sm font-medium text-white">
                      {result.tokenUsage.totalTokens}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      {result.tokenUsage.promptTokens} / {result.tokenUsage.completionTokens}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Стоимость</div>
                    <div className="mt-2 text-sm font-medium text-white">
                      {formatRub(result.billing.chargedRub)}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Баланс после</div>
                    <div className="mt-2 text-sm font-medium text-white">
                      {formatRub(result.billing.balanceAfterRub)}
                    </div>
                  </div>
                </div>
              ) : null}

              {result?.warnings?.length ? (
                <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
                  {result.warnings.join(' ')}
                </div>
              ) : null}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
