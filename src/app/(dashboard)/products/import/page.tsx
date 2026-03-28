'use client';

import { useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorAlert } from '@/components/ui/error-alert';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { JsonBlock } from '@/components/ui/json-block';
import { PageHeader } from '@/components/ui/page-header';
import { Textarea } from '@/components/ui/textarea';
import type {
  ProductImportCommitResponse,
  ProductImportPreviewResponse,
} from '@/types/api';

export default function ProductImportPage() {
  const [file, setFile] = useState<File | null>(null);

  const [previewData, setPreviewData] = useState<ProductImportPreviewResponse | null>(null);
  const [commitData, setCommitData] = useState<ProductImportCommitResponse | null>(null);

  const [previewing, setPreviewing] = useState(false);
  const [committing, setCommitting] = useState(false);

  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');

  const [defaultTonePreset, setDefaultTonePreset] = useState('friendly');
  const [defaultToneNotes, setDefaultToneNotes] = useState(`Пиши ответы на отзывы от лица бренда на русском языке. Тон — вежливый, живой, спокойный и профессиональный. Ответ должен звучать естественно, как ручной ответ человека, без канцелярита, без пафоса и без шаблонных фраз.

Обращайся к покупателю на «вы». Учитывай оценку и смысл отзыва: на высокие оценки отвечай тепло и позитивно, на нейтральные — спокойно и уважительно, на низкие — с эмпатией и без споров. Не оправдывайся, не обвиняй покупателя, не обесценивай его опыт.

Не выдумывай факты о товаре, характеристиках, гарантии, доставке, возврате или причинах проблемы. Не обещай того, что нельзя гарантировать. Не используй эмодзи и избитые фразы вроде «спасибо за обратную связь» или «будем рады видеть вас снова», если можно сказать естественнее.

Если отзыв пустой, делай короткий, уместный и живой ответ по оценке. Оптимальная длина — 1–3 предложения. Каждый ответ должен быть человечным, аккуратным и не похожим на шаблон.`);
  const [defaultProductRules, setDefaultProductRules] = useState('Здесь указываются общие правила для товаров одной категории. Например: какие свойства допустимо упоминать, какие ограничения важно учитывать, чего нельзя обещать покупателю, и какие формулировки лучше использовать в ответах. Если у отдельных товаров есть особые особенности, их лучше добавлять отдельно в правила конкретного товара.');

  const [selectedExtra1, setSelectedExtra1] = useState('');
  const [selectedExtra2, setSelectedExtra2] = useState('');

  async function handlePreview() {
    if (!file) {
      setErrorText('Сначала выбери XLSX-файл');
      return;
    }

    setPreviewing(true);
    setErrorText('');
    setSuccessText('');
    setCommitData(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await apiFetch<ProductImportPreviewResponse>('/products/import/preview', {
        method: 'POST',
        auth: true,
        body: formData,
      });

      setPreviewData(result);

      setSelectedExtra1('');
      setSelectedExtra2('');
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось выполнить preview');
    } finally {
      setPreviewing(false);
    }
  }

  async function handleCommit() {
    if (!previewData?.draftToken) {
      setErrorText('Сначала нужно выполнить preview файла');
      return;
    }

    setCommitting(true);
    setErrorText('');
    setSuccessText('');

    try {
      const payload = {
        draftToken: previewData.draftToken,
        selectedExtra1: selectedExtra1 || undefined,
        selectedExtra2: selectedExtra2 || undefined,
        defaultTonePreset: defaultTonePreset || undefined,
        defaultToneNotes: defaultToneNotes || undefined,
        defaultProductRules: defaultProductRules || undefined,
      };

      const result = await apiFetch<ProductImportCommitResponse>('/products/import/commit', {
        method: 'POST',
        auth: true,
        body: JSON.stringify(payload),
      });

      setCommitData(result);
      setSuccessText(`Импорт подтверждён. Загружено товаров: ${result.importedRows}`);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось выполнить commit');
    } finally {
      setCommitting(false);
    }
  }

  const previewRows = useMemo(() => {
    return previewData?.sample ?? [];
  }, [previewData]);

  const extraOptions = previewData?.availableExtraColumns ?? [];

  const filteredExtra2Options = extraOptions.filter((item) => item !== selectedExtra1);
  const filteredExtra1Options = extraOptions.filter((item) => item !== selectedExtra2);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Импорт OZON"
        description="Загрузка XLSX-файла OZON: сначала preview, затем выбор дополнительных колонок и подтверждение импорта."
      />

      {errorText ? <ErrorAlert text={errorText} /> : null}

      {successText ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {successText}
        </div>
      ) : null}

      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Файл XLSX" hint="Импорт OZON xlsx-файла товаров">
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </Field>

          <div className="flex items-end">
            <Button onClick={handlePreview} disabled={previewing || !file}>
              {previewing ? 'Читаем файл...' : 'Сделать preview'}
            </Button>
          </div>

          <Field label="Default tone preset">
            <Input
              value={defaultTonePreset}
              onChange={(e) => setDefaultTonePreset(e.target.value)}
            />
          </Field>

          <Field label="Default tone notes">
            <Textarea
              value={defaultToneNotes}
              onChange={(e) => setDefaultToneNotes(e.target.value)}
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Default product rules">
              <Textarea
                value={defaultProductRules}
                onChange={(e) => setDefaultProductRules(e.target.value)}
              />
            </Field>
          </div>

          {previewData ? (
            <>
              <Field
                label="Дополнительная колонка №1"
                hint="Будет сохранена как extra1Name/extra1Value"
              >
                <select
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                  value={selectedExtra1}
                  onChange={(e) => setSelectedExtra1(e.target.value)}
                >
                  <option value="">Не выбирать</option>
                  {filteredExtra1Options.map((column) => (
                    <option key={column} value={column}>
                      {column}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Дополнительная колонка №2"
                hint="Будет сохранена как extra2Name/extra2Value"
              >
                <select
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                  value={selectedExtra2}
                  onChange={(e) => setSelectedExtra2(e.target.value)}
                >
                  <option value="">Не выбирать</option>
                  {filteredExtra2Options.map((column) => (
                    <option key={column} value={column}>
                      {column}
                    </option>
                  ))}
                </select>
              </Field>
            </>
          ) : null}

          <div className="md:col-span-2 flex justify-end">
            <Button variant="secondary" onClick={handleCommit} disabled={committing || !previewData}>
              {committing ? 'Подтверждаем...' : 'Подтвердить импорт'}
            </Button>
          </div>
        </div>
      </Card>

      {!previewData ? (
        <EmptyState
          title="Preview ещё не выполнен"
          text="Выбери файл и нажми кнопку preview."
        />
      ) : null}

      {previewData ? (
        <Card>
          <div className="space-y-2">
            <div className="text-lg font-semibold text-white">Результат preview</div>
            <div className="text-sm text-white/70">
              Найдено строк: {previewData.totalRows}
            </div>
            <div className="text-sm text-white/70">
              Доступные дополнительные колонки:{' '}
              {previewData.availableExtraColumns.length
                ? previewData.availableExtraColumns.join(', ')
                : 'нет'}
            </div>
          </div>
        </Card>
      ) : null}

      {previewRows.length ? (
        <Card>
          <div className="mb-4 text-lg font-semibold text-white">Примеры строк из файла</div>
          <DataTable rows={previewRows} />
        </Card>
      ) : null}

      {previewData ? (
        <Card>
          <JsonBlock title="Полный ответ preview" data={previewData} />
        </Card>
      ) : null}

      {commitData ? (
        <Card>
          <JsonBlock title="Ответ commit" data={commitData} />
        </Card>
      ) : null}
    </div>
  );
}