'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CreatePaymentRequest, PaymentItem } from '@/types/api';
import { apiFetch } from '@/lib/api-client';
import { formatDateTime, formatMinorToRub } from '@/lib/format';
import { useAuth } from '@/components/auth/auth-provider';
import { PaymentStatusPanel, humanPaymentStatus } from '@/components/billing/payment-status-panel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorAlert } from '@/components/ui/error-alert';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';

const POLL_INTERVAL_MS = 3000;
const PAYMENT_LIFETIME_MS = 5 * 60 * 1000;
const MIN_TOPUP_RUB = 10;

function resolveExpiresAt(payment: PaymentItem | null) {
  if (!payment) return null;

  if (payment.expiresAt) {
    const expires = new Date(payment.expiresAt);
    if (!Number.isNaN(expires.getTime())) {
      return expires;
    }
  }

  if (payment.createdAt) {
    const created = new Date(payment.createdAt);
    if (!Number.isNaN(created.getTime())) {
      return new Date(created.getTime() + PAYMENT_LIFETIME_MS);
    }
  }

  return null;
}

function formatCountdown(ms: number) {
  if (ms <= 0) return '00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function BillingTopupPage() {
  const { user } = useAuth();
  const [amountRub, setAmountRub] = useState('100');
  const [receiptEmail, setReceiptEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [payment, setPayment] = useState<PaymentItem | null>(null);
  const [polling, setPolling] = useState(false);
  const [countdownText, setCountdownText] = useState('05:00');

  useEffect(() => {
    if (user?.email) {
      setReceiptEmail((current) => current || user.email);
    }
  }, [user?.email]);

  useEffect(() => {
    if (!payment?.id || (payment.status !== 'created' && payment.status !== 'pending')) {
      setPolling(false);
      return;
    }

    let stopped = false;
    setPolling(true);

    const sync = async () => {
      try {
        const next = await apiFetch<PaymentItem>(`/payments/${payment.id}?refresh=1`, {
          method: 'GET',
          auth: true,
        });

        if (!stopped) {
          setPayment(next);
          if (next.status !== 'created' && next.status !== 'pending') {
            setPolling(false);
          }
        }
      } catch {
        if (!stopped) {
          setPolling(false);
        }
      }
    };

    void sync();
    const interval = window.setInterval(() => {
      void sync();
    }, POLL_INTERVAL_MS);

    return () => {
      stopped = true;
      window.clearInterval(interval);
    };
  }, [payment?.id, payment?.status]);

  useEffect(() => {
    const expiresAt = resolveExpiresAt(payment);
    if (!expiresAt || (payment?.status !== 'created' && payment?.status !== 'pending')) {
      setCountdownText('05:00');
      return;
    }

    const tick = () => {
      const diff = expiresAt.getTime() - Date.now();
      setCountdownText(formatCountdown(diff));
    };

    tick();
    const interval = window.setInterval(tick, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [payment]);

  const expiresAtText = useMemo(() => {
    const expiresAt = resolveExpiresAt(payment);
    return expiresAt ? formatDateTime(expiresAt.toISOString()) : '—';
  }, [payment]);

  const amountNumber = Number(amountRub);
  const amountInvalid = !Number.isFinite(amountNumber) || amountNumber < MIN_TOPUP_RUB;

  async function handleCreate() {
    setCreating(true);
    setErrorText('');

    try {
      const amount = Number(amountRub);

      if (!Number.isFinite(amount) || amount < MIN_TOPUP_RUB) {
        throw new Error('Минимальная сумма пополнения — 10 ₽');
      }

      const payload: CreatePaymentRequest = {
        amountRub: amount,
        receiptEmail: receiptEmail.trim() || undefined,
      };

      const response = await apiFetch<PaymentItem>('/payments/create', {
        method: 'POST',
        auth: true,
        body: JSON.stringify(payload),
      });

      setPayment(response);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось создать платёж');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Пополнение баланса"
        description="Создайте платёж для пополнения баланса. Минимальная сумма — 10 ₽. После оплаты статус обновится автоматически, а чек отправится на указанный e-mail."
      />

      {errorText ? <ErrorAlert text={errorText} /> : null}

      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Сумма пополнения, ₽" hint="Минимум 10 рублей.">
            <Input
              type="number"
              min="10"
              step="0.01"
              value={amountRub}
              onChange={(event) => setAmountRub(event.target.value)}
              placeholder="Например, 500"
            />
          </Field>

          <Field
            label="E-mail для электронного чека"
            hint="На этот адрес будет отправлен кассовый чек после успешной оплаты."
          >
            <Input
              type="email"
              value={receiptEmail}
              onChange={(event) => setReceiptEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </Field>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={handleCreate} disabled={creating || amountInvalid}>
            {creating ? 'Создаём платёж...' : 'Создать платёж'}
          </Button>
        </div>
      </Card>

      {payment ? (
        <>
          <Card>
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
                  Статус: {humanPaymentStatus(payment.status)}
                </div>
                {polling ? (
                  <div className="rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-200">
                    Автообновление включено
                  </div>
                ) : null}
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <InfoRow label="Сумма" value={formatMinorToRub(payment.amountMinor)} />
                <InfoRow label="Создан" value={formatDateTime(payment.createdAt)} />
                <InfoRow label="Срок действия" value={`5 минут до ${expiresAtText}`} />
                <InfoRow label="Обратный отсчёт" value={countdownText} />
              </div>

              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                <div className="text-sm font-medium text-emerald-100">Как оплатить</div>
                <ol className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
                  <li>1. Нажмите кнопку «Открыть страницу оплаты».</li>
                  <li>2. На странице оплаты откройте QR-код и оплатите через СБП.</li>
                  <li>3. После оплаты статус на этой странице обновится автоматически.</li>
                </ol>

                {payment.paymentUrl ? (
                  <div className="mt-4">
                    <a href={payment.paymentUrl} target="_blank" rel="noreferrer">
                      <Button variant="secondary">Открыть страницу оплаты</Button>
                    </a>
                  </div>
                ) : null}
              </div>
            </div>
          </Card>

          {(payment.status === 'paid' || payment.status === 'failed' || payment.status === 'canceled') ? (
            <PaymentStatusPanel payment={payment} />
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
      <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="mt-2 text-sm font-medium text-white">{value}</div>
    </div>
  );
}
