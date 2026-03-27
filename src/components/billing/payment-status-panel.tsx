import Link from 'next/link';
import type { PaymentItem } from '@/types/api';
import { formatDateTime, formatMinorToRub } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

function getStatusMeta(status?: string | null) {
  switch (status) {
    case 'paid':
      return {
        title: 'Оплата подтверждена',
        description: 'Баланс уже пополнен или будет обновлён в ближайшие секунды.',
        badge: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/20',
      };
    case 'failed':
      return {
        title: 'Оплата не прошла',
        description: 'Платёж был отклонён. Можно создать новый и попробовать снова.',
        badge: 'bg-red-500/15 text-red-200 border-red-400/20',
      };
    case 'canceled':
      return {
        title: 'Платёж отменён',
        description: 'Пополнение не завершено. При необходимости создайте новый платёж.',
        badge: 'bg-slate-500/15 text-slate-200 border-slate-400/20',
      };
    case 'pending':
      return {
        title: 'Ожидаем оплату',
        description: 'После оплаты статус обновится автоматически.',
        badge: 'bg-amber-400/15 text-amber-200 border-amber-300/20',
      };
    default:
      return {
        title: 'Платёж создан',
        description: 'Откройте страницу оплаты и завершите пополнение.',
        badge: 'bg-white/10 text-white border-white/10',
      };
  }
}

export function PaymentStatusPanel({
  payment,
  title,
  description,
  showActions = true,
}: {
  payment: PaymentItem | null;
  title?: string;
  description?: string;
  showActions?: boolean;
}) {
  const meta = getStatusMeta(payment?.status);

  return (
    <Card>
      <div className="space-y-5">
        <div>
          <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${meta.badge}`}>
            {meta.title}
          </div>
          <h2 className="mt-4 text-xl font-semibold text-white">{title || meta.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">{description || meta.description}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <InfoRow label="Сумма" value={formatMinorToRub(payment?.amountMinor)} />
          <InfoRow label="Статус" value={humanPaymentStatus(payment?.status)} />
          <InfoRow label="Дата создания" value={formatDateTime(payment?.createdAt)} />
          <InfoRow label="Дата оплаты" value={formatDateTime(payment?.paidAt)} />
          <InfoRow label="E-mail для чека" value={stringOrDash(payment?.receiptEmail)} />
          <InfoRow label="Телефон для чека" value={stringOrDash(payment?.receiptPhone)} />
        </div>

        {payment?.errorMessage ? (
          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {payment.errorMessage}
          </div>
        ) : null}

        {showActions ? (
          <div className="flex flex-wrap gap-3">
            {payment?.paymentUrl ? (
              <a href={payment.paymentUrl} target="_blank" rel="noreferrer">
                <Button>Открыть страницу оплаты</Button>
              </a>
            ) : null}
            <Link href="/billing/topup">
              <Button variant="secondary">Создать новый платёж</Button>
            </Link>
            <Link href="/billing/payments">
              <Button variant="ghost">История платежей</Button>
            </Link>
          </div>
        ) : null}
      </div>
    </Card>
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

export function humanPaymentStatus(status?: string | null) {
  switch (status) {
    case 'created':
      return 'Создан';
    case 'pending':
      return 'Ожидает оплаты';
    case 'paid':
      return 'Оплачен';
    case 'failed':
      return 'Неуспешно';
    case 'canceled':
      return 'Отменён';
    default:
      return '—';
  }
}

function stringOrDash(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : '—';
}
