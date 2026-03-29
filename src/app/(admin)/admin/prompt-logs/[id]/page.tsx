'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { AdminPromptLogItem } from '@/types/api';
import { apiFetch } from '@/lib/api-client';
import { formatDateTime } from '@/lib/format';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorAlert } from '@/components/ui/error-alert';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { PageHeader } from '@/components/ui/page-header';

export default function AdminPromptLogDetailPage() {
  const params = useParams();
  const id = String(params.id ?? '');

  const [item, setItem] = useState<AdminPromptLogItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setErrorText('');

        const result = await apiFetch<AdminPromptLogItem>(`/admin/prompt-logs/${id}`, {
          method: 'GET',
          auth: true,
        });

        if (!cancelled) {
          setItem(result ?? null);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorText(error instanceof Error ? error.message : 'Не удалось загрузить prompt log');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <LoadingScreen title="Загружаем prompt log..." />;
  }

  if (errorText) {
    return (
      <div className="space-y-6">
        <PageHeader title="Prompt log" description="Детали prompt log." />
        <ErrorAlert text={errorText} />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="space-y-6">
        <PageHeader title="Prompt log" description="Детали prompt log." />
        <EmptyState title="Запись не найдена" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prompt log"
        description="Полная информация по конкретному prompt log, включая prompt, generated reply и связанный review."
      />

      <Card>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoBox label="ID" value={item.id} />
          <InfoBox label="Пользователь" value={item.user?.email || item.user?.name || '—'} />
          <InfoBox label="ReviewLog" value={item.reviewLogId || '—'} />
          <InfoBox label="Создан" value={formatDateTime(item.createdAt)} />
          <InfoBox label="Service tier" value={item.serviceTierCode} />
          <InfoBox label="Модель" value={item.model} />
          <InfoBox label="Длина prompt" value={String(item.assembledPrompt?.length ?? 0)} />
          <InfoBox label="Длина reply" value={String(item.generatedReply?.length ?? 0)} />
        </div>
      </Card>

      {item.reviewLog ? (
        <Card>
          <div className="mb-4 text-lg font-semibold text-white">Связанный отзыв</div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InfoBox label="ID отзыва" value={item.reviewLog.id} />
            <InfoBox label="Пользователь" value={item.reviewLog.user?.email || item.reviewLog.user?.name || '—'} />
            <InfoBox label="Товар" value={item.reviewLog.product?.name || '—'} />
            <InfoBox label="Оценка" value={String(item.reviewLog.rating ?? '—')} />
          </div>
          {item.reviewLog.reviewText ? (
            <TextBlock title="Текст отзыва" value={item.reviewLog.reviewText} />
          ) : null}
        </Card>
      ) : null}

      <Card>
        <TextBlock title="System prompt" value={item.systemPrompt} />
      </Card>

      <Card>
        <TextBlock title="Assembled prompt" value={item.assembledPrompt} />
      </Card>

      {item.generatedReply ? (
        <Card>
          <TextBlock title="Generated reply" value={item.generatedReply} />
        </Card>
      ) : null}

      {item.productContextJson ? (
        <Card>
          <div className="mb-4 text-lg font-semibold text-white">Product context</div>
          <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-xs leading-6 text-slate-300">
            {JSON.stringify(item.productContextJson, null, 2)}
          </pre>
        </Card>
      ) : null}
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
      <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="mt-2 break-words text-sm font-medium text-white whitespace-pre-wrap">{value}</div>
    </div>
  );
}

function TextBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="space-y-3">
      <div className="text-lg font-semibold text-white">{title}</div>
      <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm leading-6 text-slate-200">
        {value}
      </pre>
    </div>
  );
}
