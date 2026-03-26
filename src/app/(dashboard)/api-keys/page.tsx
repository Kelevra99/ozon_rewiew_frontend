'use client';

import { useEffect, useState } from 'react';
import type { ApiKeyItem, CreateApiKeyResponse } from '@/types/api';
import { apiFetch } from '@/lib/api-client';
import { toArray } from '@/lib/data';
import { formatDateTime } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorAlert } from '@/components/ui/error-alert';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';

export default function ApiKeysPage() {
  const [items, setItems] = useState<ApiKeyItem[]>([]);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [plainKey, setPlainKey] = useState<string | null>(null);
  const [errorText, setErrorText] = useState('');

  async function loadKeys() {
    setLoading(true);
    setErrorText('');

    try {
      const result = await apiFetch<unknown>('/api-keys', {
        method: 'GET',
        auth: true,
      });
      setItems(toArray<ApiKeyItem>(result));
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось загрузить ключи');
    } finally {
      setLoading(false);
    }
  }

  async function createKey() {
    setCreating(true);
    setErrorText('');
    setPlainKey(null);

    try {
      const result = await apiFetch<CreateApiKeyResponse>('/api-keys', {
        method: 'POST',
        auth: true,
        body: JSON.stringify(name ? { name } : {}),
      });

      setPlainKey(result.plainKey);
      setName('');
      await loadKeys();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось создать ключ');
    } finally {
      setCreating(false);
    }
  }

  useEffect(() => {
    void loadKeys();
  }, []);

  const rows = items.map((item) => ({
    id: item.id,
    name: item.name ?? '—',
    createdAt: item.createdAt ? formatDateTime(item.createdAt) : '—',
    lastUsedAt: item.lastUsedAt ? formatDateTime(item.lastUsedAt) : '—',
    isActive: typeof item.isActive === 'boolean' ? String(item.isActive) : '—',
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="API ключи"
        description="Этот раздел создаёт sk_user_xxx для расширения. JWT сюда не подставляется и не смешивается с ключом интеграции."
      />

      {errorText ? <ErrorAlert text={errorText} /> : null}

      {plainKey ? (
        <Card>
          <div className="text-lg font-semibold text-white">Новый ключ</div>
          <div className="mt-3 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
            <code className="break-all text-sm text-amber-100">{plainKey}</code>
          </div>
          <div className="mt-3 text-sm text-slate-300">
            Сохрани его сейчас. Plain key показывается только в момент создания.
          </div>
        </Card>
      ) : null}

      <Card>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <Field label="Название ключа" hint="Необязательно, если backend поддерживает name">
            <Input
              placeholder="Например: мой браузер / рабочий профиль"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
          <Button onClick={createKey} disabled={creating}>
            {creating ? 'Создаём...' : 'Создать ключ'}
          </Button>
        </div>
      </Card>

      {!loading && !rows.length ? (
        <EmptyState
          title="API ключей пока нет"
          text="Создай первый ключ и вставь его в расширение."
        />
      ) : null}

      {rows.length ? (
        <Card>
          <DataTable rows={rows} preferredColumns={['id', 'name', 'createdAt', 'lastUsedAt', 'isActive']} />
        </Card>
      ) : null}
    </div>
  );
}
