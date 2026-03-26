'use client';

import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import type { PaymentItem } from '@/types/api';
import { apiFetch } from '@/lib/api-client';
import { formatRubles } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorAlert } from '@/components/ui/error-alert';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { JsonBlock } from '@/components/ui/json-block';
import { PageHeader } from '@/components/ui/page-header';

function buildBankOpenLink(payment: PaymentItem | null) {
  if (!payment?.sbpPayload) return null;
  if (payment.sbpPayload.startsWith('http://') || payment.sbpPayload.startsWith('https://')) {
    return payment.sbpPayload;
  }
  return `https://qr.nspk.ru/${encodeURIComponent(payment.sbpPayload)}`;
}

export default function BillingTopupPage() {
  const [amountRub, setAmountRub] = useState('100');
  const [creating, setCreating] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [result, setResult] = useState<PaymentItem | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const bankOpenLink = useMemo(() => buildBankOpenLink(result), [result]);

  useEffect(() => {
    let cancelled = false;

    async function makeQr() {
      if (!result?.sbpPayload) {
        setQrDataUrl('');
        return;
      }

      try {
        const next = await QRCode.toDataURL(result.sbpPayload, {
          errorCorrectionLevel: 'M',
          margin: 1,
          width: 320,
        });
        if (!cancelled) {
          setQrDataUrl(next);
        }
      } catch {
        if (!cancelled) {
          setQrDataUrl('');
        }
      }
    }

    void makeQr();

    return () => {
      cancelled = true;
    };
  }, [result?.sbpPayload]);

  async function handleCreate() {
    setCreating(true);
    setErrorText('');
    setCopied(false);

    try {
      const amount = Number(amountRub.replace(',', '.'));
      const response = await apiFetch<PaymentItem>('/payments/create', {
        method: 'POST',
        auth: true,
        body: JSON.stringify({
          amountRub: Number.isFinite(amount) ? amount : undefined,
        }),
      });

      setResult(response);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось создать платёж');
    } finally {
      setCreating(false);
    }
  }

  async function copyPayload() {
    if (!result?.sbpPayload) return;
    try {
      await navigator.clipboard.writeText(result.sbpPayload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Пополнение баланса через СБП"
        description="Создаём самостоятельный SBP-платёж Ozon Acquiring. После создания backend вернёт SBP payload, который можно оплатить по QR-коду или открыть в банковском приложении."
      />

      {errorText ? <ErrorAlert text={errorText} /> : null}

      <Card>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <Field label="Сумма пополнения, ₽">
            <Input
              type="number"
              min="10"
              step="0.01"
              value={amountRub}
              onChange={(event) => setAmountRub(event.target.value)}
            />
          </Field>

          <Button onClick={handleCreate} disabled={creating}>
            {creating ? 'Создаём СБП-платёж...' : 'Создать платёж'}
          </Button>
        </div>

        <div className="mt-3 text-sm text-slate-400">
          Минимальная сумма пополнения — 10 ₽.
        </div>
      </Card>

      {result ? (
        <Card>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="text-xl font-semibold text-white">Платёж создан</div>
              <div className="text-sm text-slate-300">
                Статус: <span className="font-medium text-white">{result.status ?? 'pending'}</span>
              </div>
              <div className="text-sm text-slate-300">
                Сумма: <span className="font-medium text-white">{formatRubles(result.amountRub ?? 0)}</span>
              </div>
              <div className="text-sm text-slate-300">
                ID платежа в кабинете: <span className="font-medium text-white">{result.id}</span>
              </div>
              <div className="text-sm text-slate-300">
                Внешний номер: <span className="font-medium text-white">{result.providerOrderId ?? '—'}</span>
              </div>
              <div className="text-sm text-slate-300">
                Ozon paymentId: <span className="font-medium text-white">{result.providerPaymentId ?? '—'}</span>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                {bankOpenLink ? (
                  <a
                    href={bankOpenLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-2xl bg-amber-300 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-amber-200"
                  >
                    Открыть оплату / перейти в банк
                  </a>
                ) : null}

                <Button variant="secondary" onClick={copyPayload}>
                  {copied ? 'Скопировано' : 'Скопировать SBP payload'}
                </Button>

                {result.id ? (
                  <a
                    href={`/billing/topup/result?paymentId=${encodeURIComponent(result.id)}`}
                    className="inline-flex items-center justify-center rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/15"
                  >
                    Открыть страницу результата
                  </a>
                ) : null}
              </div>
            </div>

            <div className="mx-auto w-full max-w-[340px] shrink-0 rounded-3xl border border-white/10 bg-slate-950/40 p-4">
              <div className="mb-3 text-center text-sm text-slate-300">Сканируйте QR в банковском приложении</div>
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="SBP QR" className="mx-auto h-auto w-full rounded-2xl bg-white p-3" />
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">
                  QR пока недоступен. Используйте кнопку открытия или копирования payload.
                </div>
              )}
            </div>
          </div>

          {result.sbpPayload ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <div className="mb-2 text-sm font-medium text-white">SBP payload</div>
              <div className="break-all text-xs leading-6 text-slate-300">{result.sbpPayload}</div>
            </div>
          ) : null}
        </Card>
      ) : null}

      {result ? (
        <Card>
          <JsonBlock title="Ответ create payment" data={result} />
        </Card>
      ) : null}
    </div>
  );
}
