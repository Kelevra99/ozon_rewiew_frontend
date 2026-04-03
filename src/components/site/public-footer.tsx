import Link from 'next/link';

const footerLinks = [
  { href: '/offer', label: 'Публичная оферта' },
  { href: '/payment', label: 'Оплата' },
  { href: '/privacy', label: 'Политика ПД' },
  { href: '/personal-data-consent', label: 'Согласие на обработку ПД' },
  { href: '/support', label: 'Поддержка' },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/35 backdrop-blur">
      <div className="mx-auto max-w-[1280px] px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-amber-300/80">
              SELLERREPLY
            </div>
            <div className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              Сервис SellerReply для генерации ответов на отзывы на
              маркетплейсах. Оператор — ИП Никонов Юрий Александрович.
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {footerLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-lg font-semibold text-white">Поддержка</div>
            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              <div>
                Телефон:{' '}
                <a
                  href="tel:+79102857815"
                  className="text-amber-200 underline underline-offset-4"
                >
                  +7 910 285-78-15
                </a>
              </div>
              <div>
                E-mail:{' '}
                <a
                  href="mailto:nikonov.yuriy@gmail.com"
                  className="text-amber-200 underline underline-offset-4"
                >
                  nikonov.yuriy@gmail.com
                </a>
              </div>
              <div>
                Telegram:{' '}
                <a
                  href="https://t.me/kairox_global"
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-200 underline underline-offset-4"
                >
                  @kairox_global
                </a>
              </div>
              <div className="text-slate-400">
                Возвраты и спорные списания рассматриваются по заявке в
                поддержку.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-5 text-xs leading-6 text-slate-500">
          ИП Никонов Юрий Александрович · ОГРНИП 320366800086472 · ИНН
          026608318626 · Адрес регистрации: 394000, Воронежская область,
          Воронеж, Антонова-Овсеенко, 35Э, 402
        </div>
      </div>
    </footer>
  );
}
