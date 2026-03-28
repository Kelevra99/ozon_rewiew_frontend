'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { toArray } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorAlert } from '@/components/ui/error-alert';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { JsonBlock } from '@/components/ui/json-block';
import { PageHeader } from '@/components/ui/page-header';

type ServiceTierRow = {
  id: string;
  code: 'standard' | 'advanced' | 'expert';
  title: string;
  openAiModel: string;
  inputPriceUsdPer1m: string | number;
  outputPriceUsdPer1m: string | number;
  cachedInputPriceUsdPer1m?: string | number | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type TierForm = {
  code: 'standard' | 'advanced' | 'expert';
  title: string;
  openAiModel: string;
  inputPriceUsdPer1m: string;
  outputPriceUsdPer1m: string;
  cachedInputPriceUsdPer1m: string;
  isActive: boolean;
};

const ORDER: Array<'standard' | 'advanced' | 'expert'> = ['standard', 'advanced', 'expert'];

function emptyTier(code: 'standard' | 'advanced' | 'expert'): TierForm {
  return {
    code,
    title: code[0].toUpperCase() + code.slice(1),
    openAiModel: '',
    inputPriceUsdPer1m: '',
    outputPriceUsdPer1m: '',
    cachedInputPriceUsdPer1m: '',
    isActive: true,
  };
}

function toForm(row: ServiceTierRow): TierForm {
  return {
    code: row.code,
    title: row.title ?? row.code,
    openAiModel: row.openAiModel ?? '',
    inputPriceUsdPer1m: String(row.inputPriceUsdPer1m ?? ''),
    outputPriceUsdPer1m: String(row.outputPriceUsdPer1m ?? ''),
    cachedInputPriceUsdPer1m:
      row.cachedInputPriceUsdPer1m === null || row.cachedInputPriceUsdPer1m === undefined
        ? ''
        : String(row.cachedInputPriceUsdPer1m),
    isActive: Boolean(row.isActive),
  };
}

export default function ServiceTiersPage() {
  const [rows, setRows] = useState<ServiceTierRow[]>([]);
  const [forms, setForms] = useState<Record<string, TierForm>>({
    standard: emptyTier('standard'),
    advanced: emptyTier('advanced'),
    expert: emptyTier('expert'),
  });
  const [loading, setLoading] = useState(true);
  const [savingCode, setSavingCode] = useState<string | null>(null);
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');

  async function load() {
    setLoading(true);
    setErrorText('');

    try {
      const result = await apiFetch('/admin/service-tiers', {
        method: 'GET',
        auth: true,
      });

      const list = toArray<ServiceTierRow>(result);
      setRows(list);

      const nextForms: Record<string, TierForm> = {
        standard: emptyTier('standard'),
        advanced: emptyTier('advanced'),
        expert: emptyTier('expert'),
      };

      for (const row of list) {
        nextForms[row.code] = toForm(row);
      }

      setForms(nextForms);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось загрузить service tiers');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const orderedRows = useMemo(() => {
    return ORDER.map((code) => rows.find((row) => row.code === code)).filter(Boolean) as ServiceTierRow[];
  }, [rows]);

  function setFormValue(code: string, patch: Partial<TierForm>) {
    setForms((prev) => ({
      ...prev,
      [code]: {
        ...prev[code],
        ...patch,
      },
    }));
  }

  async function saveTier(code: 'standard' | 'advanced' | 'expert') {
    const form = forms[code];
    setSavingCode(code);
    setErrorText('');
    setSuccessText('');

    try {
      await apiFetch('/admin/service-tiers', {
        method: 'POST',
        auth: true,
        body: JSON.stringify({
          code: form.code,
          title: form.title.trim(),
          openAiModel: form.openAiModel.trim(),
          inputPriceUsdPer1m: Number(form.inputPriceUsdPer1m),
          outputPriceUsdPer1m: Number(form.outputPriceUsdPer1m),
          cachedInputPriceUsdPer1m:
            form.cachedInputPriceUsdPer1m.trim() === ''
              ? undefined
              : Number(form.cachedInputPriceUsdPer1m),
          isActive: form.isActive,
        }),
      });

      setSuccessText(`Уровень ${code} сохранён`);
      await load();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось сохранить service tier');
    } finally {
      setSavingCode(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin: service tiers"
        description="Здесь задаются модель OpenAI и цены для уровней standard / advanced / expert. Расширение по-прежнему показывает только три уровня, а backend использует выбранную здесь конфигурацию из БД."
        actions={
          <Button variant="secondary" onClick={() => void load()}>
            Обновить
          </Button>
        }
      />

      {errorText ? <ErrorAlert text={errorText} /> : null}
      {successText ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {successText}
        </div>
      ) : null}

      {loading ? (
        <Card>
          <div className="text-sm text-slate-400">Загрузка service tiers...</div>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-3">
        {ORDER.map((code) => {
          const form = forms[code];

          return (
            <Card key={code}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-white">{code}</div>
                  <div className="text-sm text-slate-400">
                    Пользователь выбирает этот уровень в расширении, а backend берёт модель и цены отсюда.
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setFormValue(code, { isActive: e.target.checked })}
                  />
                  Активен
                </label>
              </div>

              <div className="space-y-4">
                <Field label="Название уровня">
                  <Input value={form.title} onChange={(e) => setFormValue(code, { title: e.target.value })} />
                </Field>

                <Field label="Модель OpenAI">
                  <Input
                    value={form.openAiModel}
                    onChange={(e) => setFormValue(code, { openAiModel: e.target.value })}
                    placeholder="например: gpt-4o-mini"
                  />
                </Field>

                <Field label="Input price USD / 1M">
                  <Input
                    value={form.inputPriceUsdPer1m}
                    onChange={(e) => setFormValue(code, { inputPriceUsdPer1m: e.target.value })}
                  />
                </Field>

                <Field label="Output price USD / 1M">
                  <Input
                    value={form.outputPriceUsdPer1m}
                    onChange={(e) => setFormValue(code, { outputPriceUsdPer1m: e.target.value })}
                  />
                </Field>

                <Field label="Cached input price USD / 1M">
                  <Input
                    value={form.cachedInputPriceUsdPer1m}
                    onChange={(e) => setFormValue(code, { cachedInputPriceUsdPer1m: e.target.value })}
                  />
                </Field>

                <div className="pt-2">
                  <Button onClick={() => void saveTier(code)} disabled={savingCode === code}>
                    {savingCode === code ? 'Сохраняем...' : 'Сохранить'}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {orderedRows.length ? (
        <Card>
          <JsonBlock title="Текущие service tiers из БД" data={orderedRows} />
        </Card>
      ) : null}
    </div>
  );
}
