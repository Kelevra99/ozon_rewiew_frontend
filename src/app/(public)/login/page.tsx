'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorAlert } from '@/components/ui/error-alert';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrorText('');

    try {
      await login({ email, password });
      router.replace('/dashboard');
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось выполнить вход');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#203257_0%,#0f172a_35%,#020617_100%)] px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-amber-300/80">OZON AUTO REPLY</div>
          <h1 className="mt-3 text-3xl font-semibold text-white">Вход в кабинет</h1>
          <p className="mt-2 text-sm text-slate-400">
            Кабинет работает по JWT. API key для расширения создаётся после входа.
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Email">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </Field>

            <Field label="Пароль">
              <Input
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </Field>

            {errorText ? <ErrorAlert text={errorText} /> : null}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Входим...' : 'Войти'}
            </Button>
          </form>
        </Card>

        <div className="text-center text-sm text-slate-400">
          Нет аккаунта?{' '}
          <Link href="/register" className="text-amber-300 hover:text-amber-200">
            Зарегистрироваться
          </Link>
        </div>
      </div>
    </div>
  );
}
