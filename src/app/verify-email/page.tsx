'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorAlert } from '@/components/ui/error-alert';
import { Input } from '@/components/ui/input';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailFallback() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#203257_0%,#0f172a_35%,#020617_100%)] px-6 py-12 text-white">
      <div className="mx-auto max-w-lg">
        <Card>
          <div className="text-xs uppercase tracking-[0.24em] text-amber-300/80">SELLERREPLY</div>
          <h1 className="mt-3 text-3xl font-semibold text-white">Подтвердите почту</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">Загружаем страницу подтверждения...</p>
        </Card>
      </div>
    </main>
  );
}

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    verifyEmail,
    resendEmailVerification,
    getPendingVerificationEmail,
  } = useAuth();

  const initialEmail = useMemo(() => {
    return searchParams.get('email') || getPendingVerificationEmail() || '';
  }, [searchParams, getPendingVerificationEmail]);

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  useEffect(() => {
    const sent = searchParams.get('sent');
    if (sent === '1') {
      setSuccessText('Код подтверждения отправлен на вашу почту.');
    }
    if (sent === '0') {
      setSuccessText('Аккаунт создан, но письмо не отправилось автоматически. Нажмите «Отправить код ещё раз».');
    }
  }, [searchParams]);

  async function handleVerify() {
    setErrorText('');
    setSuccessText('');

    if (!email.trim()) {
      setErrorText('Укажите email.');
      return;
    }

    if (!/^\d{6}$/.test(code.trim())) {
      setErrorText('Код должен состоять из 6 цифр.');
      return;
    }

    try {
      setVerifyLoading(true);
      await verifyEmail({
        email: email.trim().toLowerCase(),
        code: code.trim(),
      });
      router.replace('/dashboard');
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось подтвердить почту');
    } finally {
      setVerifyLoading(false);
    }
  }

  async function handleResend() {
    setErrorText('');
    setSuccessText('');

    if (!email.trim()) {
      setErrorText('Укажите email, чтобы отправить код ещё раз.');
      return;
    }

    try {
      setResendLoading(true);
      await resendEmailVerification({
        email: email.trim().toLowerCase(),
      });
      setSuccessText('Новый код отправлен на почту.');
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось отправить код повторно');
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#203257_0%,#0f172a_35%,#020617_100%)] px-6 py-12 text-white">
      <div className="mx-auto max-w-lg">
        <Card>
          <div className="text-xs uppercase tracking-[0.24em] text-amber-300/80">SELLERREPLY</div>
          <h1 className="mt-3 text-3xl font-semibold text-white">Подтвердите почту</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Мы отправили 6-значный код подтверждения на вашу почту. Введите его ниже, чтобы завершить регистрацию и войти в кабинет.
          </p>

          {errorText ? <div className="mt-4"><ErrorAlert text={errorText} /></div> : null}

          {successText ? (
            <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {successText}
            </div>
          ) : null}

          <div className="mt-6 space-y-4">
            <div>
              <div className="mb-2 text-sm font-medium text-white">E-mail</div>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="mb-2 text-sm font-medium text-white">Код подтверждения</div>
              <Input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="123456"
                inputMode="numeric"
                maxLength={6}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={handleVerify} disabled={verifyLoading}>
              {verifyLoading ? 'Проверяем...' : 'Подтвердить почту'}
            </Button>

            <Button variant="secondary" onClick={handleResend} disabled={resendLoading}>
              {resendLoading ? 'Отправляем...' : 'Отправить код ещё раз'}
            </Button>
          </div>

          <div className="mt-6 text-sm leading-6 text-slate-400">
            Если вы уже пытались войти, но увидели сообщение о неподтверждённой почте, просто введите код здесь.
          </div>
        </Card>
      </div>
    </main>
  );
}
