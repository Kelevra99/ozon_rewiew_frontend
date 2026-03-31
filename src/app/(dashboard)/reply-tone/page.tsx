'use client';

import { useEffect, useState } from 'react';
import type { UserDto } from '@/types/api';
import { apiFetch } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorAlert } from '@/components/ui/error-alert';
import { Field } from '@/components/ui/field';
import { PageHeader } from '@/components/ui/page-header';
import { Textarea } from '@/components/ui/textarea';

const TONE_PRESET_OPTIONS = [
  { value: 'friendly', label: 'Дружелюбный' },
  { value: 'neutral', label: 'Нейтральный' },
  { value: 'business', label: 'Деловой' },
  { value: 'expert', label: 'Экспертный' },
  { value: 'warm', label: 'Тёплый' },
  { value: 'premium', label: 'Премиальный' },
];

export default function ReplyTonePage() {
  const [defaultTone, setDefaultTone] = useState('friendly');
  const [toneNotes, setToneNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setErrorText('');
        setSuccessText('');

        const user = await apiFetch<UserDto>('/users/me', {
          method: 'GET',
          auth: true,
        });

        if (cancelled) return;

        setDefaultTone(user.defaultTone || 'friendly');
        setToneNotes(user.toneNotes || '');
      } catch (error) {
        if (!cancelled) {
          setErrorText(error instanceof Error ? error.message : 'Не удалось загрузить настройки тона');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave() {
    try {
      setSaving(true);
      setErrorText('');
      setSuccessText('');

      await apiFetch<UserDto>('/users/me/reply-settings', {
        method: 'PATCH',
        auth: true,
        body: JSON.stringify({
          defaultTone,
          toneNotes,
        }),
      });

      setSuccessText('Общий тон ответов сохранён');
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось сохранить настройки тона');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Тон ответов"
        description="Здесь задаётся общий стиль ответов для всего кабинета. Этот тон будет использоваться для всех товаров пользователя."
      />

      {errorText ? <ErrorAlert text={errorText} /> : null}

      {successText ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {successText}
        </div>
      ) : null}

      <Card>
        <div className="space-y-4 text-sm leading-6 text-slate-300">
          <div className="text-lg font-semibold text-white">Как это работает</div>

          <p>
            Здесь задаётся общий тон ответов для всего аккаунта. Его не нужно дублировать в каждой карточке товара:
            вы настраиваете стиль один раз, и он подставляется в генерацию для всех ваших товаров.
          </p>

          <p>
            В карточках товаров остаются только товарные данные: аннотация, специальные правила, ограничения,
            совместимость и другие факты, которые помогают корректно отвечать именно по конкретному товару.
          </p>

          <p>
            Если вы захотите изменить стиль ответов, теперь это делается в одном месте, без редактирования
            сотен или тысяч карточек.
          </p>
        </div>
      </Card>

      <Card>
        <div className="space-y-6">
          <Field label="Пресет тона" hint="Короткий общий тип стиля для вашего кабинета.">
            <select
              value={defaultTone}
              onChange={(e) => setDefaultTone(e.target.value)}
              disabled={loading || saving}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none"
            >
              {TONE_PRESET_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Общий тон ответов"
            hint="Главная инструкция для генерации. Здесь можно описать стиль, роль продавца, допустимые формулировки, длину ответа, поведение в спорных ситуациях и общий характер общения."
          >
            <Textarea
              value={toneNotes}
              onChange={(e) => setToneNotes(e.target.value)}
              disabled={loading || saving}
            />
          </Field>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={loading || saving}>
              {saving ? 'Сохраняем...' : 'Сохранить'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
