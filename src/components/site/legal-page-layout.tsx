import type { ReactNode } from 'react';
import Link from 'next/link';
import { PublicFooter } from '@/components/site/public-footer';

export function LegalPageLayout({
  title,
  description,
  updatedAt,
  children,
}: {
  title: string;
  description: string;
  updatedAt?: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#203257_0%,#0f172a_35%,#020617_100%)] text-white">
      <section className="mx-auto max-w-[980px] px-6 pb-10 pt-10">
        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-slate-300">
          <Link href="/" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/10">
            На главную
          </Link>
          <Link href="/support" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/10">
            Поддержка
          </Link>
          <Link href="/register" className="rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 font-medium text-amber-100 transition hover:bg-amber-300/20">
            Регистрация
          </Link>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur md:p-8">
          <div className="text-xs uppercase tracking-[0.24em] text-amber-300/80">SELLERREPLY</div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">{description}</p>
          {updatedAt ? (
            <div className="mt-4 text-sm text-slate-500">Редакция от {updatedAt}</div>
          ) : null}

          <div className="mt-8 space-y-8 text-sm leading-7 text-slate-200">{children}</div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
