'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ErrorAlert } from '@/components/ui/error-alert';
import { Input } from '@/components/ui/input';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    verifyEmail,
    resendEmailVerification,
    getPendingVerificationEmail,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');

  useEffect(() => {
    const fromQuery = searchParams.get('email')?.trim() || '';
    const fromStorage = getPendingVerificationEmail()?.trim() || '';
    setEmail(fromQuery || fromStorage);
  }, [searchParams, getPendingVerificationEmail]);

  const canVerify = useMemo(() => {
    return email.trim().length > 0 && code.trim().length >= 6 && !verifying;
  }, [email, code, verifying]);

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setVerifying(true);
    setErrorText('');
    setSuccessText('');

    try {
      await verifyEmail({
        email: email.trim(),
        code: code.trim(),
      });

      setSuccessText('Почта подтверждена. Перенаправляем в кабинет...');
      setTimeout(() => {
        router.replace('/dashboard');
      }, 700);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось подтвердить почту');
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    if (!email.trim()) {
      setErrorText('Не удалось определить email для повторной отправки кода');
      return;
    }

    setResending(true);
    setErrorText('');
    setSuccessText('');

    try {
      await resendEmailVerification({
        email: email.trim(),
      });
      setSuccessText('Код подтверждения отправлен повторно.');
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось отправить код повторно');
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#203257_0%,#0f172a_35%,#020617_100%)] px-4 py-10 text-white">
      <div className="mx-auto max-w-[560px] space-y-6">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.24em] text-amber-300/80">SELLERREPLY</div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Подтверждение почты</h1>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Введите код из письма, чтобы завершить регистрацию.
          </p>
        </div>

        {errorText ? <ErrorAlert text={errorText} /> : null}

        {successText ? (
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {successText}
          </div>
        ) : null}

        <Card>
          <form className="space-y-5" onSubmit={handleVerify}>
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
              <label className="text-sm font-medium text-white">Код подтверждения</label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Введите 6-значный код"
                inputMode="numeric"
                autoComplete="one-time-code"
              />
            </div>

            <Button type="submit" className="w-full" disabled={!canVerify}>
              {verifying ? 'Подтверждаем...' : 'Подтвердить почту'}
            </Button>

            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => void handleResend()}
              disabled={resending || !email.trim()}
            >
              {resending ? 'Отправляем...' : 'Отправить код повторно'}
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
