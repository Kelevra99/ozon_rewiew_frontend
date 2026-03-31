'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorAlert } from '@/components/ui/error-alert';
import { Input } from '@/components/ui/input';

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 3l18 18" />
      <path d="M10.58 10.58A2 2 0 0 0 12 16a2 2 0 0 0 1.42-.58" />
      <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c6.5 0 10 7 10 7a17.78 17.78 0 0 1-4.23 5.17" />
      <path d="M6.61 6.61A17.31 17.31 0 0 0 2 12s3.5 7 10 7a10.9 10.9 0 0 0 5.39-1.39" />
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedDocs, setAcceptedDocs] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');

  const canSubmit = useMemo(() => {
    return (
      name.trim().length > 0 &&
      email.trim().length > 0 &&
      password.length > 0 &&
      acceptedDocs &&
      !registering
    );
  }, [name, email, password, acceptedDocs, registering]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!acceptedDocs) {
      setErrorText('Подтвердите согласие с документами, чтобы продолжить регистрацию.');
      return;
    }

    setRegistering(true);
    setErrorText('');
    setSuccessText('');

    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      setSuccessText('Регистрация прошла успешно. Сейчас перенаправим вас на страницу входа.');
      setTimeout(() => {
        router.push('/login');
      }, 900);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось зарегистрироваться');
    } finally {
      setRegistering(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#203257_0%,#0f172a_35%,#020617_100%)] px-4 py-10 text-white">
      <div className="mx-auto max-w-[560px] space-y-6">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.24em] text-amber-300/80">KAIROX</div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Регистрация</h1>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Создайте аккаунт, чтобы пользоваться сервисом генерации ответов на отзывы.
          </p>
        </div>

        {errorText ? <ErrorAlert text={errorText} /> : null}

        {successText ? (
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {successText}
          </div>
        ) : null}

        <Card>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Имя</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Введите имя"
                autoComplete="name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">E-mail</label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введите e-mail"
                type="email"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Пароль</label>

              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 pr-12 text-sm text-white outline-none transition focus:border-amber-300/70"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-xl p-2 text-slate-300 transition hover:bg-white/5 hover:text-white"
                  aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                  title={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3 text-sm leading-6 text-slate-300">
              <input
                type="checkbox"
                checked={acceptedDocs}
                onChange={(e) => setAcceptedDocs(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-950/40"
              />
              <span>
                Я принимаю условия{' '}
                <Link
                  href="/offer"
                  className="font-semibold text-sky-300 underline underline-offset-4 transition hover:text-sky-200"
                >
                  Публичной оферты
                </Link>{' '}
                и даю согласие на обработку персональных данных в соответствии с{' '}
                <Link
                  href="/privacy"
                  className="font-semibold text-sky-300 underline underline-offset-4 transition hover:text-sky-200"
                >
                  Политикой обработки персональных данных
                </Link>.
              </span>
            </label>

            <Button type="submit" className="w-full" disabled={!canSubmit}>
              {registering ? 'Регистрируем...' : 'Зарегистрироваться'}
            </Button>

            <div className="text-center text-sm text-slate-400">
              Уже есть аккаунт?{' '}
              <Link href="/login" className="text-amber-200 underline underline-offset-4">
                Войти
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}
