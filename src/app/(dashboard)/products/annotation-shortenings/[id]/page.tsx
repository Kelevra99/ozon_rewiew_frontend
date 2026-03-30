'use client';

import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorAlert } from '@/components/ui/error-alert';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { PageHeader } from '@/components/ui/page-header';
import { useRecord } from '@/hooks/use-record';
import { formatDateTime } from '@/lib/format';

type AnnotationShorteningDetail = {
  id: string;
  originalAnnotation?: string | null;
  sourceAnnotation?: string | null;
  shortenedAnnotation?: string | null;
  model?: string | null;
  promptTokens?: number | null;
  completionTokens?: number | null;
  totalTokens?: number | null;
  latencyMs?: number | null;
  chargedRub?: string | number | null;
  chargedMinor?: number | null;
  usdRubRate?: string | number | null;
  markupMultiplier?: string | number | null;
  systemPrompt?: string | null;
  assembledPrompt?: string | null;
  createdAt?: string | null;
  product?: {
    id: string;
    article?: string | null;
    name?: string | null;
    brand?: string | null;
    model?: string | null;
  } | null;
  serviceTier?: {
    title?: string | null;
    code?: string | null;
    openAiModel?: string | null;
    inputPriceUsdPer1m?: string | number | null;
    outputPriceUsdPer1m?: string | number | null;
  } | null;
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

export default function ProductAnnotationShorteningDetailPage() {
  const params = useParams();
  const id = String(params.id ?? '');
  const path = `/products/annotation-shortenings/${id}`;
  const { data, loading, errorText } = useRecord<AnnotationShorteningDetail>(path);

  if (loading) return <LoadingScreen title="Загружаем сокращение..." />;

  if (errorText) {
    return (
      <div className="space-y-6">
        <PageHeader title="Сокращение описания" description="Подробная информация по одному сокращению аннотации товара." />
        <ErrorAlert text={errorText} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Сокращение описания" description="Подробная информация по одному сокращению аннотации товара." />
        <EmptyState title="Данные не найдены" />
      </div>
    );
  }

  const serviceTier = data.serviceTier ?? null;
  const inputTokens = data.promptTokens ?? 0;
  const outputTokens = data.completionTokens ?? 0;
  const totalTokens = data.totalTokens ?? inputTokens + outputTokens;

  const usdRubRate = asNumber(data.usdRubRate);
  const markupMultiplier = asNumber(data.markupMultiplier);
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

  const totalChargedRub = asNumber(data.chargedRub);
  const fullPrompt = [data.systemPrompt, data.assembledPrompt].filter(Boolean).join('\n\n');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Сокращение описания"
        description="Подробная информация по одному сокращению аннотации товара."
      />

      <Card>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <InfoRow label="ID сокращения" value={data.id || '—'} />
          <InfoRow label="Дата генерации" value={formatDateTime(data.createdAt ?? '')} />
          <InfoRow label="Модель" value={data.model || serviceTier?.openAiModel || '—'} />

          <InfoRow label="Товар" value={data.product?.name || '—'} />
          <InfoRow label="Артикул" value={data.product?.article || '—'} />
          <InfoRow label="Бренд" value={data.product?.brand || '—'} />
        </div>
      </Card>

      <Card>
        <div className="text-lg font-semibold text-white">Итоговое сокращённое описание</div>
        <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-50 whitespace-pre-wrap">
          {data.shortenedAnnotation || '—'}
        </div>
      </Card>

      <Card>
        <div className="text-lg font-semibold text-white">Исходное описание товара</div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm leading-6 text-slate-100 whitespace-pre-wrap">
          {data.originalAnnotation || '—'}
        </div>
      </Card>

      <Card>
        <div className="text-lg font-semibold text-white">Текст, отправленный в модель</div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm leading-6 text-slate-100 whitespace-pre-wrap">
          {data.sourceAnnotation || '—'}
        </div>
      </Card>

      <Card>
        <div className="text-lg font-semibold text-white">Данные запроса к OpenAI</div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoRow label="Модель" value={data.model || serviceTier?.openAiModel || '—'} />
          <InfoRow label="Режим" value={serviceTier?.title || serviceTier?.code || '—'} />
          <InfoRow label="Всего токенов" value={String(totalTokens || 0)} />
          <InfoRow label="Время ответа" value={data.latencyMs != null ? `${data.latencyMs} мс` : '—'} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
            <div className="text-sm font-medium text-white">Входные токены</div>
            <div className="mt-3 text-2xl font-semibold text-white">{inputTokens} t</div>
            <div className="mt-2 text-sm text-slate-300">Стоимость: {formatRub(inputRub)}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
            <div className="text-sm font-medium text-white">Выходные токены</div>
            <div className="mt-3 text-2xl font-semibold text-white">{outputTokens} t</div>
            <div className="mt-2 text-sm text-slate-300">Стоимость: {formatRub(outputRub)}</div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">
          Итого списано: <span className="font-semibold">{formatRubCompact(totalChargedRub)}</span>
        </div>
      </Card>

      <Card>
        <div className="text-lg font-semibold text-white">Промт</div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm leading-6 text-slate-100 whitespace-pre-wrap break-words">
          {fullPrompt || 'Промт не найден'}
        </div>
      </Card>
    </div>
  );
}
