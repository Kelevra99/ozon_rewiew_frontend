'use client';

import { useMemo, useState } from 'react';
import type { AdminDashboardDailyItem } from '@/types/api';
import { formatRubles } from '@/lib/format';
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

export function AdminFinanceChart({
  data,
  period,
  onPeriodChange,
}: {
  data: AdminDashboardDailyItem[];
  period: 7 | 30 | 90;
  onPeriodChange: (period: 7 | 30 | 90) => void;
}) {
  const safeData = data.length
    ? data
    : [
        {
          date: new Date().toISOString().slice(0, 10),
          topupRub: 0,
          chargedRub: 0,
          openAiCostRub: 0,
          grossProfitRub: 0,
          repliesCount: 0,
          paidPaymentsCount: 0,
          promptLogsCount: 0,
        },
      ];

  const [hoveredIndex, setHoveredIndex] = useState<number>(safeData.length - 1);

  const maxValue = Math.max(...safeData.map((item) => item.chargedRub), 0.01);
  const active = safeData[Math.min(hoveredIndex, safeData.length - 1)] ?? safeData[safeData.length - 1];
  const labelStep = safeData.length > 14 ? Math.ceil(safeData.length / 7) : 1;

  const totals = useMemo(() => {
    return safeData.reduce(
      (acc, item) => {
        acc.topupRub += item.topupRub;
        acc.chargedRub += item.chargedRub;
        acc.openAiCostRub += item.openAiCostRub;
        acc.grossProfitRub += item.grossProfitRub;
        acc.repliesCount += item.repliesCount;
        acc.paidPaymentsCount += item.paidPaymentsCount;
        acc.promptLogsCount += item.promptLogsCount;
        return acc;
      },
      {
        topupRub: 0,
        chargedRub: 0,
        openAiCostRub: 0,
        grossProfitRub: 0,
        repliesCount: 0,
        paidPaymentsCount: 0,
        promptLogsCount: 0,
      },
    );
  }, [safeData]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm text-slate-400">
          Столбики показывают дневную выручку по генерациям. Наведите курсор на день, чтобы посмотреть все детали ниже.
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryBox label="Пополнения за период" value={formatRubles(totals.topupRub)} />
        <SummaryBox label="Выручка за период" value={formatRubles(totals.chargedRub)} />
        <SummaryBox label="Себестоимость за период" value={formatRubles(totals.openAiCostRub)} />
        <SummaryBox label="Валовая разница" value={formatRubles(totals.grossProfitRub)} />
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
              item.chargedRub > 0
                ? Math.max((item.chargedRub / maxValue) * 220, 10)
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
                    title={`${formatFullDate(item.date)} — ${formatRubles(item.chargedRub)}`}
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoBox label="Дата" value={formatFullDate(active.date)} />
        <InfoBox label="Генерации" value={String(active.repliesCount)} />
        <InfoBox label="Prompt logs" value={String(active.promptLogsCount)} />
        <InfoBox label="Успешные платежи" value={String(active.paidPaymentsCount)} />
        <InfoBox label="Пополнения" value={formatRubles(active.topupRub)} />
        <InfoBox label="Выручка" value={formatRubles(active.chargedRub)} />
        <InfoBox label="Себестоимость" value={formatRubles(active.openAiCostRub)} />
        <InfoBox label="Валовая разница" value={formatRubles(active.grossProfitRub)} />
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
