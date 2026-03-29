'use client';

import { useEffect, useState } from 'react';
import type { ApiKeyItem, CreateApiKeyResponse } from '@/types/api';
import { apiFetch } from '@/lib/api-client';
import { toArray } from '@/lib/data';
import { formatDateTime } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorAlert } from '@/components/ui/error-alert';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';

export default function ApiKeysPage() {
  const [items, setItems] = useState<ApiKeyItem[]>([]);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [plainKey, setPlainKey] = useState<string | null>(null);
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');

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
    setSuccessText('');
    setPlainKey(null);

    try {
      const result = await apiFetch<CreateApiKeyResponse>('/api-keys', {
        method: 'POST',
        auth: true,
        body: JSON.stringify(name.trim() ? { name: name.trim() } : {}),
      });

      setPlainKey(result.plainKey);
      setName('');
      setSuccessText('Ключ создан. Скопируйте его и сразу добавьте в расширение.');
      await loadKeys();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось создать ключ');
    } finally {
      setCreating(false);
    }
  }

  async function copyKey() {
    if (!plainKey) return;

    try {
      await navigator.clipboard.writeText(plainKey);
      setSuccessText('Ключ скопирован в буфер обмена.');
    } catch {
      setErrorText('Не удалось скопировать ключ. Скопируйте его вручную.');
    }
  }

  async function deactivateKey(id: string) {
    setProcessingId(id);
    setErrorText('');
    setSuccessText('');

    try {
      await apiFetch(`/api-keys/${id}/deactivate`, {
        method: 'PATCH',
        auth: true,
      });
      setSuccessText('Ключ отключён.');
      await loadKeys();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось отключить ключ');
    } finally {
      setProcessingId(null);
    }
  }

  async function activateKey(id: string) {
    setProcessingId(id);
    setErrorText('');
    setSuccessText('');

    try {
      await apiFetch(`/api-keys/${id}/activate`, {
        method: 'PATCH',
        auth: true,
      });
      setSuccessText('Ключ снова активен.');
      await loadKeys();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось включить ключ');
    } finally {
      setProcessingId(null);
    }
  }

  async function deleteKey(id: string, keyName?: string | null) {
    const ok = window.confirm(
      keyName
        ? `Удалить ключ "${keyName}"?`
        : 'Удалить этот ключ?',
    );
    if (!ok) return;

    setProcessingId(id);
    setErrorText('');
    setSuccessText('');

    try {
      await apiFetch(`/api-keys/${id}`, {
        method: 'DELETE',
        auth: true,
      });
      setSuccessText('Ключ удалён.');
      await loadKeys();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось удалить ключ');
    } finally {
      setProcessingId(null);
    }
  }

  useEffect(() => {
    void loadKeys();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ключи для расширения"
        description="Здесь создаются ключи доступа для браузерного расширения. Один ключ можно назвать для удобства, использовать в нужном браузере и при необходимости потом отключить или удалить."
      />

      <Card>
        <div className="space-y-4 text-sm leading-6 text-slate-300">
          <div className="text-lg font-semibold text-white">Как это работает</div>

          <p>
            Здесь вы создаёте ключ для подключения расширения. При создании можно указать понятное название,
            например «Рабочий Chrome» или «Домашний браузер», чтобы потом легко отличать ключи между собой.
          </p>

          <p>
            После создания ключ показывается только один раз. Он будет выглядеть как
            <span className="mx-1 rounded bg-white/10 px-2 py-1 font-mono text-amber-200">sk_user_xxx</span>.
            Нужно сразу скопировать всю строку целиком, вставить её в расширение и проверить подключение.
          </p>

          <p>
            В таблице ниже отображаются название ключа, дата создания, дата последнего использования и текущий статус.
            Если ключ больше не нужен, его можно отключить, включить обратно или удалить совсем.
          </p>

          <p>
            Если вы временно давали ключ кому-то ещё или хотите остановить списания по нему, достаточно отключить его.
            После этого расширение перестанет работать с этим ключом, пока вы не включите его снова.
          </p>
        </div>
      </Card>

      {errorText ? <ErrorAlert text={errorText} /> : null}
      {successText ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {successText}
        </div>
      ) : null}

      {plainKey ? (
        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="text-lg font-semibold text-white">Новый ключ</div>
              <div className="mt-3 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
                <code className="break-all text-sm text-amber-100">{plainKey}</code>
              </div>
              <div className="mt-3 text-sm text-slate-300">
                Сохраните его сейчас. Этот ключ больше не будет показан повторно.
              </div>
            </div>

            <div className="shrink-0">
              <Button onClick={copyKey}>Скопировать ключ</Button>
            </div>
          </div>
        </Card>
      ) : null}

      <Card>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <Field label="Название ключа" hint="Например: рабочий браузер, ноутбук, тестовый профиль.">
            <Input
              placeholder="Введите название ключа"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>

          <Button onClick={createKey} disabled={creating}>
            {creating ? 'Создаём...' : 'Создать ключ'}
          </Button>
        </div>
      </Card>

      {!loading && !items.length ? (
        <EmptyState
          title="Ключей пока нет"
          text="Создайте первый ключ и добавьте его в расширение."
        />
      ) : null}

      {items.length ? (
        <Card>
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-300">Название ключа</th>
                    <th className="px-4 py-3 font-medium text-slate-300">Дата создания</th>
                    <th className="px-4 py-3 font-medium text-slate-300">Последнее использование</th>
                    <th className="px-4 py-3 font-medium text-slate-300">Статус</th>
                    <th className="px-4 py-3 font-medium text-slate-300">Действия</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item) => {
                    const isBusy = processingId === item.id;
                    const isActive = Boolean(item.isActive);

                    return (
                      <tr key={item.id} className="border-t border-white/8">
                        <td className="px-4 py-3 align-top text-white">
                          <div className="font-medium text-white">{item.name || 'Без названия'}</div>
                          <div className="mt-1 text-xs text-slate-500">{item.prefix || item.id}</div>
                        </td>

                        <td className="px-4 py-3 align-top text-white">
                          {item.createdAt ? formatDateTime(item.createdAt) : '—'}
                        </td>

                        <td className="px-4 py-3 align-top text-white">
                          {item.lastUsedAt ? formatDateTime(item.lastUsedAt) : '—'}
                        </td>

                        <td className="px-4 py-3 align-top">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                              isActive
                                ? 'border border-emerald-400/20 bg-emerald-500/10 text-emerald-200'
                                : 'border border-rose-400/20 bg-rose-500/10 text-rose-200'
                            }`}
                          >
                            {isActive ? 'Активен' : 'Отключён'}
                          </span>
                        </td>

                        <td className="px-4 py-3 align-top">
                          <div className="flex flex-wrap gap-2">
                            {isActive ? (
                              <Button
                                variant="secondary"
                                onClick={() => void deactivateKey(item.id)}
                                disabled={isBusy}
                              >
                                Отключить
                              </Button>
                            ) : (
                              <Button
                                variant="secondary"
                                onClick={() => void activateKey(item.id)}
                                disabled={isBusy}
                              >
                                Включить
                              </Button>
                            )}

                            <Button
                              variant="danger"
                              onClick={() => void deleteKey(item.id, item.name)}
                              disabled={isBusy}
                            >
                              Удалить
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
