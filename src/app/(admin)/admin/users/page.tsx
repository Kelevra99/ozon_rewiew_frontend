'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { AdminUserListItem } from '@/types/api';
import { apiFetch } from '@/lib/api-client';
import { formatDateTime, formatMinorToRub } from '@/lib/format';
import { Button, getButtonClassName } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorAlert } from '@/components/ui/error-alert';
import { PageHeader } from '@/components/ui/page-header';

export default function AdminUsersPage() {
  const [items, setItems] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErrorText('');

    try {
      const result = await apiFetch<AdminUserListItem[]>('/admin/users', {
        method: 'GET',
        auth: true,
      });
      setItems(Array.isArray(result) ? result : []);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось загрузить список пользователей');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(user: AdminUserListItem) {
    const ok = window.confirm(
      `Удалить пользователя ${user.email} вместе со всеми его данными?\n\nЭто действие необратимо.`,
    );

    if (!ok) return;

    setDeletingUserId(user.id);
    setErrorText('');
    setSuccessText('');

    try {
      await apiFetch(`/admin/users/${user.id}`, {
        method: 'DELETE',
        auth: true,
      });

      setSuccessText(`Пользователь ${user.email} удалён.`);
      setItems((prev) => prev.filter((item) => item.id !== user.id));
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось удалить пользователя');
    } finally {
      setDeletingUserId(null);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Пользователи"
        description="Полный список пользователей со статусом, балансом, числом товаров, генераций и общей финансовой сводкой."
        actions={<Button variant="secondary" onClick={() => void load()}>Обновить</Button>}
      />

      {errorText ? <ErrorAlert text={errorText} /> : null}

      {successText ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {successText}
        </div>
      ) : null}

      {!loading && !items.length ? <EmptyState title="Пользователей пока нет" /> : null}

      <Card>
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-300">E-mail</th>
                  <th className="px-4 py-3 font-medium text-slate-300">Имя</th>
                  <th className="px-4 py-3 font-medium text-slate-300">Роль</th>
                  <th className="px-4 py-3 font-medium text-slate-300">Статус</th>
                  <th className="px-4 py-3 font-medium text-slate-300">Баланс</th>
                  <th className="px-4 py-3 font-medium text-slate-300">Товары</th>
                  <th className="px-4 py-3 font-medium text-slate-300">Генерации</th>
                  <th className="px-4 py-3 font-medium text-slate-300">Пополнено</th>
                  <th className="px-4 py-3 font-medium text-slate-300">Списано</th>
                  <th className="px-4 py-3 font-medium text-slate-300">Последний вход</th>
                  <th className="px-4 py-3 font-medium text-slate-300">Действия</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr className="border-t border-white/8">
                    <td colSpan={11} className="px-4 py-8 text-center text-slate-400">
                      Загружаем пользователей...
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const deleting = deletingUserId === item.id;

                    return (
                      <tr key={item.id} className="border-t border-white/8">
                        <td className="px-4 py-3 align-top text-white">{item.email}</td>
                        <td className="px-4 py-3 align-top text-white">{item.name || '—'}</td>
                        <td className="px-4 py-3 align-top text-white">{item.role}</td>
                        <td className="px-4 py-3 align-top">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            item.isActive
                              ? 'border border-emerald-400/20 bg-emerald-500/10 text-emerald-200'
                              : 'border border-rose-400/20 bg-rose-500/10 text-rose-200'
                          }`}>
                            {item.isActive ? 'Активен' : 'Отключён'}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top text-white">{formatMinorToRub(item.balanceMinor)}</td>
                        <td className="px-4 py-3 align-top text-white">{item.productsCount}</td>
                        <td className="px-4 py-3 align-top text-white">{item.reviewsCount}</td>
                        <td className="px-4 py-3 align-top text-white">{formatMinorToRub(item.totalTopupMinor)}</td>
                        <td className="px-4 py-3 align-top text-white">{formatMinorToRub(item.totalSpentMinor)}</td>
                        <td className="px-4 py-3 align-top text-white">{formatDateTime(item.lastLoginAt ?? null)}</td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex flex-wrap gap-2">
                            <Link href={`/admin/users/${item.id}`} className={getButtonClassName('primary', 'px-4 py-2')}>
                              Открыть
                            </Link>

                            <Button
                              variant="danger"
                              onClick={() => void handleDelete(item)}
                              disabled={deleting}
                            >
                              {deleting ? 'Удаляем...' : 'Удалить'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
