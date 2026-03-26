export function formatDateTime(value: unknown): string {
  if (!value || typeof value !== 'string') return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatRubles(value: unknown): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
  }).format(value);
}

export function formatMinorToRub(value: unknown): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—';
  return formatRubles(value / 100);
}
