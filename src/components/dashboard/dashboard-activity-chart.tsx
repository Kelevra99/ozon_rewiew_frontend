'use client';

import { useMemo, useState } from 'react';
import type { DashboardDailyStat } from '@/types/api';
import { Button } from '@/components/ui/button';

function formatShortDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
  }).format(date);
}

function formatFullDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function formatSpent(value: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function DashboardActivityChart({
  data,
  period,
  onPeriodChange,
}: {
  data: DashboardDailyStat[];
  period: 7 | 30 | 90;
  onPeriodChange: (period: 7 | 30 | 90) => void;
}) {
  const safeData = data.length
    ? data
    : [{ date: new Date().toISOString().slice(0, 10), repliesCount: 0, spentRub: 0, avgRating: 0 }];

  const [hoveredIndex, setHoveredIndex] = useState<number>(safeData.length - 1);

  const maxSpent = Math.max(...safeData.map((item) => item.spentRub), 0.01);
  const active = safeData[Math.min(hoveredIndex, safeData.length - 1)] ?? safeData[safeData.length - 1];

  const labelStep = safeData.length > 14 ? Math.ceil(safeData.length / 7) : 1;

  const totals = useMemo(() => {
    return safeData.reduce(
      (acc, item) => {
        acc.replies += item.repliesCount;
        acc.spent += item.spentRub;
        return acc;
      },
      { replies: 0, spent: 0 },
    );
  }, [safeData]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm text-slate-400">
          Столбики показывают расход по дням. Наведите курсор на день, чтобы посмотреть детали ниже.
        </div>

        <div className="flex flex-wrap gap-2">
          {[7, 30, 90].map((value) => (
            <Button
              key={value}
              variant={period === value ? 'primary' : 'secondary'}
              onClick={() => onPeriodChange(value as 7 | 30 | 90)}
            >
              {value} дней
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryBox label="Ответов за период" value={String(totals.replies)} />
        <SummaryBox label="Расход за период" value={formatSpent(totals.spent)} />
        <SummaryBox label="Выбранный день" value={formatFullDate(active.date)} />
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-4">
        <div className="flex h-72 items-end gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          {safeData.map((item, index) => {
            const activeBar = index === hoveredIndex;
            const showLabel =
              index === 0 ||
              index === safeData.length - 1 ||
              index % labelStep === 0;

            const barHeightPx =
              item.spentRub > 0
                ? Math.max((item.spentRub / maxSpent) * 220, 10)
                : 4;

            return (
              <div
                key={item.date}
                className="flex h-full min-w-[20px] flex-1 flex-col items-center justify-end"
                onMouseEnter={() => setHoveredIndex(index)}
              >
                <div className="flex h-full w-full items-end">
                  <div
                    className={`w-full rounded-t-xl transition-all duration-150 ${
                      activeBar
                        ? 'bg-amber-300 shadow-lg shadow-amber-400/20'
                        : 'bg-emerald-400/80 hover:bg-emerald-300'
                    }`}
                    style={{ height: `${barHeightPx}px` }}
                    title={`${formatFullDate(item.date)} — ${formatSpent(item.spentRub)}`}
                  />
                </div>

                <div className="mt-2 h-4 text-[11px] text-slate-500">
                  {showLabel ? formatShortDate(item.date) : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <InfoBox label="Дата" value={formatFullDate(active.date)} />
        <InfoBox label="Количество отзывов" value={String(active.repliesCount)} />
        <InfoBox label="Расход" value={formatSpent(active.spentRub)} />
        <InfoBox
          label="Средняя оценка"
          value={active.avgRating ? active.avgRating.toFixed(2) : '0.00'}
        />
      </div>
    </div>
  );
}

function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
      <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="mt-2 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
      <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="mt-2 text-sm font-medium text-white">{value}</div>
    </div>
  );
}
