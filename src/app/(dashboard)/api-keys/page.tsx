'use client';

import { useEffect, useMemo, useState } from 'react';
import type {
  ApiKeyItem,
  CreateApiKeyResponse,
  ExternalProvider,
  ExternalProviderCredentialItem,
} from '@/types/api';
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

const PROVIDERS: Array<{ code: ExternalProvider; label: string }> = [
  { code: 'ozon', label: 'OZON API' },
  { code: 'wildberries', label: 'Wildberries API' },
  { code: 'yandex_market', label: 'Яндекс Маркет API' },
];

const EMPTY_SECRETS: Record<ExternalProvider, string> = {
  ozon: '',
  wildberries: '',
  yandex_market: '',
};

export default function ApiKeysPage() {
  const [items, setItems] = useState<ApiKeyItem[]>([]);
  const [connections, setConnections] = useState<ExternalProviderCredentialItem[]>([]);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connectionsLoading, setConnectionsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [savingProvider, setSavingProvider] = useState<ExternalProvider | null>(null);
  const [name, setName] = useState('');
  const [plainKey, setPlainKey] = useState<string | null>(null);
  const [externalSecrets, setExternalSecrets] = useState<Record<ExternalProvider, string>>(
    EMPTY_SECRETS,
  );
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');

  async function loadKeys() {
    setLoading(true);

    try {
      const result = await apiFetch<unknown>('/api-keys', {
        method: 'GET',
        auth: true,
      });
      setItems(toArray<ApiKeyItem>(result));
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось загрузить API-ключи');
    } finally {
      setLoading(false);
    }
  }

  async function loadConnections() {
    setConnectionsLoading(true);

    try {
      const result = await apiFetch<ExternalProviderCredentialItem[]>(
        '/external-provider-credentials',
        {
          method: 'GET',
          auth: true,
        },
      );
      setConnections(Array.isArray(result) ? result : []);
    } catch (error) {
      setErrorText(
        error instanceof Error
          ? error.message
          : 'Не удалось загрузить внешние API-подключения',
      );
    } finally {
      setConnectionsLoading(false);
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
      setSuccessText(
        'API-ключ SellerReply создан. Скопируйте его и сразу добавьте в 1С, CRM, сайт или другую интеграцию.',
      );
      await loadKeys();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось создать API-ключ');
    } finally {
      setCreating(false);
    }
  }

  async function copyKey() {
    if (!plainKey) return;

    try {
      await navigator.clipboard.writeText(plainKey);
      setSuccessText('API-ключ скопирован в буфер обмена.');
    } catch {
      setErrorText('Не удалось скопировать ключ. Скопируйте его вручную.');
    }
  }

  async function saveProviderCredential(provider: ExternalProvider) {
    const secret = externalSecrets[provider]?.trim();

    if (!secret) {
      const providerLabel = PROVIDERS.find((item) => item.code === provider)?.label ?? provider;
      setErrorText(`Введите ключ для ${providerLabel}.`);
      return;
    }

    setSavingProvider(provider);
    setErrorText('');
    setSuccessText('');

    try {
      const providerLabel = PROVIDERS.find((item) => item.code === provider)?.label ?? provider;

      await apiFetch<ExternalProviderCredentialItem>(
        `/external-provider-credentials/${provider}`,
        {
          method: 'PUT',
          auth: true,
          body: JSON.stringify({ secret }),
        },
      );

      setExternalSecrets((prev) => ({
        ...prev,
        [provider]: '',
      }));
      setSuccessText(`${providerLabel} сохранён.`);
      await loadConnections();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось сохранить внешний API-ключ');
    } finally {
      setSavingProvider(null);
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
      setSuccessText('API-ключ SellerReply отключён.');
      await loadKeys();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось отключить API-ключ');
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
      setSuccessText('API-ключ SellerReply снова активен.');
      await loadKeys();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось включить API-ключ');
    } finally {
      setProcessingId(null);
    }
  }

  async function deleteKey(id: string, keyName?: string | null) {
    const ok = window.confirm(
      keyName ? `Удалить API-ключ "${keyName}"?` : 'Удалить этот API-ключ?',
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
      setSuccessText('API-ключ SellerReply удалён.');
      await loadKeys();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось удалить API-ключ');
    } finally {
      setProcessingId(null);
    }
  }

  const connectionMap = useMemo(() => {
    const map = new Map<ExternalProvider, ExternalProviderCredentialItem>();

    for (const item of connections) {
      map.set(item.provider, item);
    }

    return map;
  }, [connections]);

  useEffect(() => {
    void loadKeys();
    void loadConnections();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="API-ключи и подключения"
        description="Здесь вы создаёте API-ключ SellerReply для своих систем и настраиваете внешние API-подключения для автоматической обработки отзывов."
      />

      <Card>
        <div className="space-y-4 text-sm leading-6 text-slate-300">
          <div className="text-lg font-semibold text-white">Как это работает</div>

          <p>
            Здесь вы создаёте API-ключ SellerReply. Он нужен, чтобы ваши 1С, CRM,
            сайт или другая интеграция могли обращаться к нашему сервису,
            передавать отзывы на обработку и получать готовый результат.
          </p>

          <p>
            После создания ключ показывается только один раз. Он будет выглядеть как
            <span className="mx-1 rounded bg-white/10 px-2 py-1 font-mono text-amber-200">
              sk_user_xxx
            </span>
            . Нужно сразу скопировать его и сохранить в своей системе.
          </p>

          <p>
            Ниже можно отдельно сохранить внешние API-ключи пользователя:
            OZON API, Wildberries API и Яндекс Маркет API. Они хранятся в
            зашифрованном виде, повторно не показываются и привязываются только
            к вашему кабинету.
          </p>

          <p>
            Позже, когда ваша система вызовет SellerReply с вашим ключом и
            попросит запустить обработку, сервер найдёт внешний API-ключ нужного
            провайдера именно у вашего пользователя, выполнит запрос и спишет
            стоимость обработки с вашего баланса.
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
              <div className="text-lg font-semibold text-white">
                Новый API-ключ SellerReply
              </div>
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
          <Field
            label="Название API-ключа SellerReply"
            hint="Например: 1С, рабочая CRM, сайт, внутренняя интеграция."
          >
            <Input
              placeholder="Введите название API-ключа"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>

          <Button onClick={createKey} disabled={creating}>
            {creating ? 'Создаём...' : 'Создать API-ключ'}
          </Button>
        </div>
      </Card>

      <Card>
        <div className="space-y-4">
          <div>
            <div className="text-lg font-semibold text-white">
              Внешние API-подключения
            </div>
            <div className="mt-2 text-sm leading-6 text-slate-300">
              Сохраняйте здесь внешние ключи ваших систем. Каждая строка
              сохраняется отдельно и привязывается только к вашему кабинету.
            </div>
          </div>

          <div className="space-y-4">
            {PROVIDERS.map((provider) => {
              const item =
                connectionMap.get(provider.code) ?? {
                  provider: provider.code,
                  isConfigured: false,
                  maskedValue: null,
                  lastUsedAt: null,
                };

              const isSaving = savingProvider === provider.code;

              return (
                <div
                  key={provider.code}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_auto] lg:items-end">
                    <div className="space-y-2">
                      <div className="text-base font-semibold text-white">
                        {provider.label}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 font-medium ${
                            item.isConfigured
                              ? 'border border-emerald-400/20 bg-emerald-500/10 text-emerald-200'
                              : 'border border-white/10 bg-white/5 text-slate-300'
                          }`}
                        >
                          {item.isConfigured ? 'Сохранён' : 'Не задан'}
                        </span>

                        {item.maskedValue ? (
                          <span className="font-mono text-slate-400">
                            {item.maskedValue}
                          </span>
                        ) : null}
                      </div>

                      <div className="text-xs leading-5 text-slate-500">
                        Последнее использование:{' '}
                        {item.lastUsedAt ? formatDateTime(item.lastUsedAt) : '—'}
                      </div>
                    </div>

                    <Field
                      label="API-ключ"
                      hint="Ключ хранится в зашифрованном виде и после сохранения повторно не отображается."
                    >
                      <Input
                        type="password"
                        autoComplete="new-password"
                        placeholder={`Введите ${provider.label}`}
                        value={externalSecrets[provider.code]}
                        onChange={(event) =>
                          setExternalSecrets((prev) => ({
                            ...prev,
                            [provider.code]: event.target.value,
                          }))
                        }
                      />
                    </Field>

                    <Button
                      onClick={() => void saveProviderCredential(provider.code)}
                      disabled={
                        connectionsLoading ||
                        isSaving ||
                        !externalSecrets[provider.code].trim()
                      }
                    >
                      {isSaving ? 'Сохраняем...' : 'Сохранить'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {!loading && !items.length ? (
        <EmptyState
          title="API-ключей SellerReply пока нет"
          text="Создайте первый ключ и используйте его в 1С, CRM, сайте или другой интеграции."
        />
      ) : null}

      {items.length ? (
        <Card>
          <div className="mb-4">
            <div className="text-lg font-semibold text-white">
              API-ключи SellerReply
            </div>
            <div className="mt-2 text-sm leading-6 text-slate-300">
              Эти ключи используются для обращения к нашему сервису из ваших систем.
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-300">
                      Название ключа
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-300">
                      Дата создания
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-300">
                      Последнее использование
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-300">
                      Статус
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-300">
                      Действия
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item) => {
                    const isBusy = processingId === item.id;
                    const isActive = Boolean(item.isActive);

                    return (
                      <tr key={item.id} className="border-t border-white/8">
                        <td className="px-4 py-3 align-top text-white">
                          <div className="font-medium text-white">
                            {item.name || 'Без названия'}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {item.prefix || item.id}
                          </div>
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
