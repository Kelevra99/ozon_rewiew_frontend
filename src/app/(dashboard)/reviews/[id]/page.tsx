'use client';

import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorAlert } from '@/components/ui/error-alert';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { PageHeader } from '@/components/ui/page-header';
import { useRecord } from '@/hooks/use-record';
import { formatDateTime } from '@/lib/format';

type ReviewDetail = {
  id: string;
  status?: string | null;
  rating?: number | null;
  authorName?: string | null;
  reviewText?: string | null;
  reviewDate?: string | null;
  generatedReply?: string | null;
  finalReply?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  detectedProductName?: string | null;
  product?: {
    id: string;
    article?: string | null;
    name?: string | null;
    brand?: string | null;
  } | null;
  usageLogs?: Array<{
    model?: string | null;
    promptTokens?: number | null;
    completionTokens?: number | null;
    totalTokens?: number | null;
    latencyMs?: number | null;
    createdAt?: string | null;
  }>;
  reviewCost?: {
    chargedRub?: string | number | null;
    chargedMinor?: number | null;
    usdRubRate?: string | number | null;
    markupMultiplier?: string | number | null;
    serviceTier?: {
      title?: string | null;
      code?: string | null;
      openAiModel?: string | null;
      inputPriceUsdPer1m?: string | number | null;
      outputPriceUsdPer1m?: string | number | null;
    } | null;
  } | null;
  promptLogs?: Array<{
    systemPrompt?: string | null;
    assembledPrompt?: string | null;
    generatedReply?: string | null;
    model?: string | null;
    serviceTierCode?: string | null;
    createdAt?: string | null;
  }>;
};

function asNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function formatRub(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  }).format(value);
}

function formatRubCompact(value: number): string {
  const roundedUp = Math.ceil(value * 100) / 100;
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(roundedUp);
}

function humanStatus(status?: string | null) {
  switch (status) {
    case 'generated':
      return 'Сгенерирован';
    case 'inserted':
      return 'Вставлен';
    case 'posted':
      return 'Опубликован';
    case 'skipped':
      return 'Пропущен';
    case 'failed':
      return 'Ошибка';
    case 'canceled':
      return 'Отменён';
    default:
      return '—';
  }
}

function calculateTokenRub({
  tokens,
  usdPer1m,
  usdRubRate,
  markupMultiplier,
}: {
  tokens: number;
  usdPer1m: number;
  usdRubRate: number;
  markupMultiplier: number;
}) {
  const usd = (tokens / 1_000_000) * usdPer1m;
  const rub = usd * usdRubRate * markupMultiplier;
  return rub;
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
      <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="mt-2 text-sm font-medium text-white whitespace-pre-wrap break-words">{value}</div>
    </div>
  );
}

export default function DetailPage() {
  const params = useParams();
  const id = String(params.id ?? '');
  const path = `/reviews/${id}`;
  const { data, loading, errorText } = useRecord<ReviewDetail>(path);

  if (loading) return <LoadingScreen title="Загружаем отзыв..." />;

  if (errorText) {
    return (
      <div className="space-y-6">
        <PageHeader title="Отзыв" description="Подробная информация по одному сгенерированному ответу." />
        <ErrorAlert text={errorText} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Отзыв" description="Подробная информация по одному сгенерированному ответу." />
        <EmptyState title="Данные не найдены" />
      </div>
    );
  }

  const usage = data.usageLogs?.[0] ?? null;
  const promptLog = data.promptLogs?.[0] ?? null;
  const reviewCost = data.reviewCost ?? null;
  const serviceTier = reviewCost?.serviceTier ?? null;

  const inputTokens = usage?.promptTokens ?? 0;
  const outputTokens = usage?.completionTokens ?? 0;
  const totalTokens = usage?.totalTokens ?? inputTokens + outputTokens;

  const usdRubRate = asNumber(reviewCost?.usdRubRate);
  const markupMultiplier = asNumber(reviewCost?.markupMultiplier);
  const inputPriceUsdPer1m = asNumber(serviceTier?.inputPriceUsdPer1m);
  const outputPriceUsdPer1m = asNumber(serviceTier?.outputPriceUsdPer1m);

  const inputRub =
    inputTokens && inputPriceUsdPer1m && usdRubRate && markupMultiplier
      ? calculateTokenRub({
          tokens: inputTokens,
          usdPer1m: inputPriceUsdPer1m,
          usdRubRate,
          markupMultiplier,
        })
      : 0;

  const outputRub =
    outputTokens && outputPriceUsdPer1m && usdRubRate && markupMultiplier
      ? calculateTokenRub({
          tokens: outputTokens,
          usdPer1m: outputPriceUsdPer1m,
          usdRubRate,
          markupMultiplier,
        })
      : 0;

  const totalChargedRub = asNumber(reviewCost?.chargedRub);
  const finalReply = data.finalReply || data.generatedReply || promptLog?.generatedReply || '—';
  const fullPrompt = [promptLog?.systemPrompt, promptLog?.assembledPrompt].filter(Boolean).join('\n\n');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Отзыв"
        description="Подробная информация по одному сгенерированному ответу."
      />

      <Card>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <InfoRow label="ID отзыва" value={data.id || '—'} />
          <InfoRow label="Статус" value={humanStatus(data.status)} />
          <InfoRow label="Оценка" value={data.rating != null ? `${data.rating} из 5` : '—'} />

          <InfoRow
            label="Товар"
            value={data.product?.name || data.detectedProductName || '—'}
          />
          <InfoRow label="Артикул" value={data.product?.article || '—'} />
          <InfoRow label="Бренд" value={data.product?.brand || '—'} />

          <InfoRow label="Автор отзыва" value={data.authorName || '—'} />
          <InfoRow label="Дата отзыва" value={data.reviewDate || '—'} />
          <InfoRow label="Дата генерации" value={formatDateTime(data.createdAt ?? '')} />
        </div>
      </Card>

      <Card>
        <div className="text-lg font-semibold text-white">Текст отзыва</div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm leading-6 text-slate-100 whitespace-pre-wrap">
          {data.reviewText || '—'}
        </div>
      </Card>

      <Card>
        <div className="text-lg font-semibold text-white">Ответ на отзыв</div>
        <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-50 whitespace-pre-wrap">
          {finalReply}
        </div>
      </Card>

      <Card>
        <div className="text-lg font-semibold text-white">Данные запроса к OpenAI</div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoRow label="Модель" value={usage?.model || promptLog?.model || serviceTier?.openAiModel || '—'} />
          <InfoRow label="Режим" value={serviceTier?.title || promptLog?.serviceTierCode || serviceTier?.code || '—'} />
          <InfoRow label="Всего токенов" value={String(totalTokens || 0)} />
          <InfoRow label="Время ответа" value={usage?.latencyMs != null ? `${usage.latencyMs} мс` : '—'} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
            <div className="text-sm font-medium text-white">Входные токены</div>
            <div className="mt-3 text-2xl font-semibold text-white">{inputTokens} t</div>
            <div className="mt-2 text-sm text-slate-300">
              Стоимость: {formatRub(inputRub)}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
            <div className="text-sm font-medium text-white">Выходные токены</div>
            <div className="mt-3 text-2xl font-semibold text-white">{outputTokens} t</div>
            <div className="mt-2 text-sm text-slate-300">
              Стоимость: {formatRub(outputRub)}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">
          Итого списано: <span className="font-semibold">{formatRubCompact(totalChargedRub)}</span>
        </div>
      </Card>

      <Card>
        <div className="text-lg font-semibold text-white">Ваш промт</div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm leading-6 text-slate-100 whitespace-pre-wrap break-words">
          {fullPrompt || 'Промт не найден'}
        </div>
      </Card>
    </div>
  );
}
