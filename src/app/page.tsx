import type { Metadata } from 'next';
import Link from 'next/link';
import { getButtonClassName } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'AI-автоответы на отзывы для продавцов маркетплейсов',
  description:
    'Finerox — сервис для живых AI-ответов на отзывы на маркетплейсах: ручная генерация, автоответы через расширение и API-режим без дорогих подписок.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Finerox — AI-автоответы на отзывы маркетплейсов',
    description:
      'Ручной режим, автоответы через расширение, API-режим, пополнение от 10 ₽ и генерация без подписок.',
    url: 'https://finerox.online',
  },
};

const stats = [
  { label: 'Старт без подписки', value: 'от 10 ₽', hint: 'Можно пополнить баланс на минимальную сумму и проверить качество сервиса на практике.' },
  { label: 'Средняя цена', value: '≈ 30 ₽ / 100 ответов', hint: 'При обычной настройке контекста и правил ответы обходятся очень дёшево.' },
  { label: 'Тонкая настройка', value: 'от 15 ₽ / 100 ответов', hint: 'Чем чище и компактнее контекст, тем ниже стоимость обработки.' },
  { label: 'Доплата за автоответы', value: '0 ₽', hint: 'Нет отдельной платы за автоматический режим: хотите вручную, хотите автоматически.' },
];

const benefits = [
  'Живые ответы вместо сухих шаблонов и однотипных формулировок.',
  'Настройка тона, правил бренда, контекста товара и типовых спорных ситуаций.',
  'Ручной режим без подключения к вашему кабинету и без передачи доступов.',
  'Автоматический режим через расширение для тех, кто хочет экономить время.',
  'API-режим для сценариев, где уже есть доступ к отзывам через маркетплейс.',
  'Без подписок: пополнили баланс и используете сервис в удобном для себя режиме.',
];

const workflows = [
  {
    title: 'Ручная генерация через расширение',
    subtitle: 'Подходит для безопасного старта и проверки качества',
    text:
      'Вы открываете отзыв, а внутри карточки появляется кнопка генерации. Сервис подбирает более живой и уместный ответ прямо в интерфейсе отзыва. Для этого режима не нужен доступ к вашему кабинету, не нужен менеджер и не нужно делиться паролями.',
    videoPath: '/public/landing/videos/manual-mode.mp4',
  },
  {
    title: 'Автоответы через расширение',
    subtitle: 'Для продавцов, которые хотят освободить время',
    text:
      'Расширение само открывает следующий неотвеченный отзыв, считывает его, генерирует ответ, вставляет и отправляет. Пока сервис работает, вы можете заниматься другими задачами, а не сидеть в одном и том же окне.',
    videoPath: '/public/landing/videos/auto-extension-mode.mp4',
  },
  {
    title: 'API-режим для отзывов',
    subtitle: 'Если у вас уже есть доступ к API отзывов',
    text:
      'В этом режиме ответы запускаются из кабинета Finerox, без постоянно открытого браузера. Сначала можно протестировать сервис вручную, а уже потом перейти к API-сценарию, если он вам действительно нужен.',
    videoPath: '/public/landing/videos/auto-api-mode.mp4',
  },
];

const comparePoints = [
  {
    title: 'Почему ответы выглядят живее',
    text:
      'Finerox строит ответ не только по оценке, но и по смыслу отзыва, данным товара, тону бренда и вашим правилам. За счёт этого ответы получаются ближе к живому общению, а не к сухой формальной отписке.',
  },
  {
    title: 'Почему это дешевле',
    text:
      'Вы платите только за реальную генерацию. Нет обязательной подписки ради доступа к автоответам, нет лишней абонентской нагрузки и нет сценария “купить дорого, чтобы просто попробовать”.',
  },
  {
    title: 'Почему проще стартовать',
    text:
      'Ручной режим позволяет начать без доступа к кабинету, без передачи учётных данных и без сложной интеграции. Вы сначала смотрите качество ответов, а уже потом решаете, нужен ли вам автоматический режим.',
  },
];

const faq = [
  {
    q: 'Нужно ли давать доступ к моему кабинету маркетплейса?',
    a: 'Для ручной генерации через расширение — нет. Вы ничего не передаёте, не создаёте менеджера и не открываете лишние доступы. Для API-режима используется только доступ к отзывам, если у вас уже есть такой сценарий.',
  },
  {
    q: 'Можно ли сначала протестировать сервис на маленькой сумме?',
    a: 'Да. Пополнение начинается от 10 ₽, поэтому можно спокойно проверить качество и понять, подходит ли вам сервис.',
  },
  {
    q: 'Нужна ли подписка, чтобы пользоваться Finerox?',
    a: 'Нет. У сервиса нет собственной обязательной подписки. Пополняете баланс и используете так, как вам удобно.',
  },
  {
    q: 'Сколько стоит генерация?',
    a: 'В среднем около 30 ₽ за 100 ответов. При грамотной настройке контекста и правил стоимость может снижаться примерно до 15 ₽ за 100 ответов.',
  },
  {
    q: 'Можно ли отвечать вручную, а потом перейти на автоматизацию?',
    a: 'Да. Это один из базовых сценариев: сначала проверяете качество вручную, затем при необходимости включаете автоматический режим.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.a,
    },
  })),
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#203257_0%,#0f172a_35%,#020617_100%)] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <header className="border-b border-white/10 bg-slate-950/35 backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-5">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-amber-300/80">FINEROX</div>
            <div className="mt-1 text-sm text-slate-300">
              AI-автоответы на отзывы для продавцов маркетплейсов
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/login" className={getButtonClassName('secondary', 'px-4 py-2')}>
              Войти
            </Link>
            <Link href="/login" className={getButtonClassName('primary', 'px-5 py-2')}>
              Зарегистрироваться
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1280px] px-6 pb-10 pt-14">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm text-amber-100">
              Для продавцов, которым нужны живые ответы на отзывы, а не дорогая подписка и шаблонные фразы
            </div>

            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
                Finerox помогает отвечать на отзывы на маркетплейсах живо, быстро и в разы дешевле дорогих подписок
              </h1>

              <p className="max-w-3xl text-lg leading-8 text-slate-300">
                Я сам продавец на маркетплейсах и делал этот сервис в первую очередь для себя и таких же продавцов,
                которым нужно не просто “закрыть обязанность отвечать”, а действительно поддерживать карточку товара
                качественными и уместными ответами. Finerox умеет работать вручную, через расширение и в автоматических
                сценариях — без лишней абонентской нагрузки и без ненужных доступов к вашему кабинету.
              </p>

              <p className="max-w-3xl text-base leading-7 text-slate-400">
                Сервис не гонится за тем, чтобы навязать подписку. Логика простая: вы пополняете баланс, тестируете
                качество, настраиваете контекст, а дальше используете ручной режим или автоматизацию так, как удобно
                именно вам.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/login" className={getButtonClassName('primary', 'px-6 py-3 text-base')}>
                Попробовать сервис
              </Link>
              <Link href="#how-it-works" className={getButtonClassName('secondary', 'px-6 py-3 text-base')}>
                Как это работает
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {stats.map((item) => (
                <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/10 backdrop-blur">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.label}</div>
                  <div className="mt-3 text-3xl font-semibold text-white">{item.value}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-400">{item.hint}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur">
            <div className="text-lg font-semibold text-white">Что вы получаете на старте</div>

            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
                Ручной режим через расширение — можно начать без доступа к кабинету и без передачи учётных данных.
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
                Автоматический режим через расширение — для тех, кто хочет экономить время и не отвечать на отзывы вручную по одному.
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
                API-сценарий — когда вам уже подходит более глубокая автоматизация и есть доступ к отзывам через маркетплейс.
              </div>
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-emerald-100">
                Пополнение от 10 ₽. Можно протестировать качество без серьёзных затрат и без привязки к подписке.
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
              <div className="text-sm font-medium text-amber-100">Важно по безопасности</div>
              <div className="mt-2 text-sm leading-6 text-slate-200">
                Для ручного режима нам не нужен доступ к вашему кабинету, не нужно создавать менеджера и не нужно выдавать лишние права.
                Сначала вы спокойно смотрите, как сервис отвечает, и только потом решаете, нужен ли вам следующий уровень автоматизации.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-6" id="benefits">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur">
          <div className="mb-4 text-2xl font-semibold text-white">Почему продавцы выбирают Finerox</div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {benefits.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-4 text-sm leading-7 text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-6" id="how-it-works">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-semibold text-white">Три сценария работы</h2>
            <p className="mt-3 max-w-4xl text-base leading-7 text-slate-300">
              Вы можете начать с самого безопасного и простого режима, а потом перейти к автоматизации. Именно в такой последовательности
              большинству продавцов проще всего протестировать сервис и понять его ценность.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            {workflows.map((item) => (
              <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur">
                <div className="text-xl font-semibold text-white">{item.title}</div>
                <div className="mt-2 text-sm text-amber-200">{item.subtitle}</div>
                <p className="mt-4 text-sm leading-7 text-slate-300">{item.text}</p>

                <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-slate-950/30 p-5">
                  <div className="text-sm font-medium text-white">Здесь будет видео-презентация</div>
                  <div className="mt-2 text-sm leading-6 text-slate-400">
                    После записи видео положите файл сюда:
                  </div>
                  <div className="mt-3 rounded-xl bg-slate-950/70 px-4 py-3 font-mono text-xs text-amber-100">
                    {item.videoPath}
                  </div>
                  <div className="mt-3 text-xs leading-6 text-slate-500">
                    Рекомендуемый формат: MP4, 1920×1080, H.264. Папка уже создана: <span className="font-mono">public/landing/videos/</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_480px]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur">
            <h2 className="text-3xl font-semibold text-white">Чем Finerox отличается от типичного шаблонного генератора</h2>

            <div className="mt-6 space-y-4">
              {comparePoints.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-4">
                  <div className="text-lg font-semibold text-white">{item.title}</div>
                  <div className="mt-2 text-sm leading-7 text-slate-300">{item.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur">
            <div className="text-2xl font-semibold text-white">Блок для сравнения ответов</div>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Здесь позже можно показать реальный пример: как отвечает Finerox и как выглядит типичный встроенный ответ.
              Это помогает сразу увидеть разницу в тоне, уместности и живости текста.
            </p>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-dashed border-white/15 bg-slate-950/30 p-5">
                <div className="text-sm font-medium text-white">Скриншот ответа Finerox</div>
                <div className="mt-3 rounded-xl bg-slate-950/70 px-4 py-3 font-mono text-xs text-amber-100">
                  /public/landing/images/compare-finerox-answer.png
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-white/15 bg-slate-950/30 p-5">
                <div className="text-sm font-medium text-white">Скриншот типичного встроенного ответа</div>
                <div className="mt-3 rounded-xl bg-slate-950/70 px-4 py-3 font-mono text-xs text-amber-100">
                  /public/landing/images/compare-marketplace-answer.png
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs leading-6 text-slate-500">
              Папка для картинок уже создана: <span className="font-mono">public/landing/images/</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur">
          <h2 className="text-3xl font-semibold text-white">Кому подходит сервис</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <PersonaCard title="Тем, кто хочет протестировать без риска">
              Пополнение от 10 ₽, ручной режим и никаких лишних доступов на старте.
            </PersonaCard>
            <PersonaCard title="Тем, кто устал отвечать одно и то же вручную">
              Автоматический режим через расширение снимает рутину и освобождает время.
            </PersonaCard>
            <PersonaCard title="Тем, кому важен тон бренда">
              Можно прописать правила, ограничения, сценарии и стиль ответов под ваш ассортимент.
            </PersonaCard>
            <PersonaCard title="Тем, кто не хочет переплачивать">
              Оплата идёт только за использование, без обязательной ежемесячной подписки.
            </PersonaCard>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur">
          <h2 className="text-3xl font-semibold text-white">Частые вопросы</h2>
          <div className="mt-6 space-y-4">
            {faq.map((item) => (
              <details key={item.q} className="rounded-2xl border border-white/10 bg-slate-950/30 px-5 py-4">
                <summary className="cursor-pointer list-none text-lg font-semibold text-white">
                  {item.q}
                </summary>
                <div className="mt-3 text-sm leading-7 text-slate-300">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 pb-16 pt-6">
        <div className="rounded-3xl border border-amber-300/20 bg-gradient-to-r from-amber-100 via-amber-200 to-orange-200 p-8 text-slate-950 shadow-[0_8px_24px_rgba(251,191,36,0.18)]">
          <div className="max-w-4xl">
            <div className="text-sm font-medium uppercase tracking-[0.2em] text-slate-700">Finerox</div>
            <h2 className="mt-3 text-3xl font-semibold">
              Попробуйте сервис на небольшой сумме и сами сравните качество ответов
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-800">
              Не нужно покупать подписку ради теста. Пополните баланс, проверьте ручной режим, настройте правила и
              только потом решайте, хотите ли вы переходить к полной автоматизации.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/login" className={getButtonClassName('primary', 'px-6 py-3 text-base')}>
                Зарегистрироваться
              </Link>
              <Link href="/dashboard" className={getButtonClassName('secondary', 'px-6 py-3 text-base')}>
                Личный кабинет
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function PersonaCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-4">
      <div className="text-lg font-semibold text-white">{title}</div>
      <div className="mt-2 text-sm leading-7 text-slate-300">{children}</div>
    </div>
  );
}
