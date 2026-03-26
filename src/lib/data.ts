export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function toArray<T = Record<string, unknown>>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];

  if (isRecord(value)) {
    const keys = [
      'items',
      'data',
      'results',
      'rows',
      'list',
      'users',
      'products',
      'reviews',
      'payments',
      'entries',
      'logs',
      'history',
      'records',
    ];

    for (const key of keys) {
      const candidate = value[key];
      if (Array.isArray(candidate)) return candidate as T[];
    }
  }

  return [];
}

export function firstRecord(value: unknown): Record<string, unknown> | null {
  if (isRecord(value)) return value;
  const list = toArray(value);
  const first = list[0];
  return isRecord(first) ? first : null;
}

export function asText(value: unknown): string {
  if (value == null) return '—';
  if (typeof value === 'string') return value || '—';
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return '—';
  }
}
