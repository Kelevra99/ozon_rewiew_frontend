'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import type { NavItem } from '@/lib/navigation';
import { canAccessAdmin } from '@/lib/navigation';
import { Button } from '@/components/ui/button';

export function AppShell({
  children,
  title,
  navItems,
}: {
  children: React.ReactNode;
  title: string;
  navItems: NavItem[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#203257_0%,#0f172a_35%,#020617_100%)] text-white">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 gap-0 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-white/10 bg-slate-950/30 p-4 backdrop-blur lg:border-b-0 lg:border-r">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-xs uppercase tracking-[0.24em] text-amber-300/80">KAIROX</div>
            <div className="mt-2 text-xl font-semibold">{title}</div>
            <div className="mt-2 text-sm text-slate-400">
              JWT-сессия для кабинета, отдельный API key для расширения.
            </div>
          </div>

          <nav className="mt-4 space-y-2">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== '/dashboard' &&
                  item.href !== '/admin' &&
                  pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-2xl px-4 py-3 text-sm transition ${
                    active
                      ? 'bg-amber-300 text-slate-950'
                      : 'border border-white/0 bg-white/0 text-slate-200 hover:border-white/10 hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {canAccessAdmin(user?.role) && !pathname.startsWith('/admin') ? (
              <Link
                href="/admin"
                className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10"
              >
                Перейти в admin
              </Link>
            ) : null}

            {pathname.startsWith('/admin') ? (
              <Link
                href="/dashboard"
                className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10"
              >
                Вернуться в кабинет
              </Link>
            ) : null}
          </nav>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/35 px-4 py-4 backdrop-blur md:px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-lg font-semibold text-white">{user?.name ?? 'Кабинет'}</div>
                <div className="text-sm text-slate-400">
                  {user?.email ?? 'Гость'} · роль: {user?.role ?? 'unknown'}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button variant="secondary" onClick={() => router.push('/profile')}>
                  Профиль
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    logout();
                    router.replace('/login');
                  }}
                >
                  Выйти
                </Button>
              </div>
            </div>
          </header>

          <main className="space-y-6 px-4 py-6 md:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
