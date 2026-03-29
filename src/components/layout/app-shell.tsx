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

  const isAdminZone = pathname.startsWith('/admin');

  function isActive(href: string) {
    return pathname === href || (href !== '/dashboard' && href !== '/admin' && pathname.startsWith(href));
  }

  function isExactActive(href: string) {
    return pathname === href;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#203257_0%,#0f172a_35%,#020617_100%)] text-white">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 gap-0 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-white/10 bg-slate-950/30 p-4 backdrop-blur lg:border-b-0 lg:border-r">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            {isAdminZone ? (
              <>
                <div className="text-xs uppercase tracking-[0.24em] text-amber-300/80">FINEROX</div>
                <div className="mt-2 text-xl font-semibold">{title}</div>
                <div className="mt-2 text-sm text-slate-400">
                  Панель управления сервисом и административными разделами.
                </div>
              </>
            ) : (
              <>
                <div className="text-xs uppercase tracking-[0.24em] text-amber-300/80">FINEROX</div>
                <div className="mt-2 text-xl font-semibold">Автоматический генератор отзывов</div>
                <div className="mt-2 text-sm text-slate-400">
                  Сервис для работы с отзывами на маркетплейсах, созданный владельцем сайта KaiRox.ru.
                </div>
              </>
            )}
          </div>

          <nav className="mt-4 space-y-2">
            {navItems.map((item) => {
              const parentActive = isExactActive(item.href);

              return (
                <div key={item.href} className="space-y-2">
                  <Link
                    href={item.href}
                    className={`block rounded-2xl border px-4 py-3 text-sm transition ${
                      parentActive
                        ? 'border-amber-200/50 bg-gradient-to-r from-amber-100 via-amber-200 to-orange-200 font-semibold !text-slate-950 shadow-[0_8px_24px_rgba(251,191,36,0.18)]'
                        : 'border-white/0 bg-white/0 text-slate-200 hover:border-white/10 hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                  </Link>

                  {item.children?.length ? (
                    <div className="ml-3 space-y-2 border-l border-white/10 pl-3">
                      {item.children.map((child) => {
                        const childActive = isActive(child.href);

                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`block rounded-2xl border px-4 py-2.5 text-sm transition ${
                              childActive
                                ? 'border-orange-200/30 bg-orange-300/15 text-orange-100 shadow-[0_6px_18px_rgba(251,146,60,0.16)]'
                                : 'border-white/0 bg-white/[0.02] text-slate-300 hover:border-white/10 hover:bg-white/5'
                            }`}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
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
