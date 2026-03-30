import type { Metadata } from 'next';
import type { ReactNode } from 'react';
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
  {
    label: 'Старт без подписки',
    value: 'от 10 ₽',
    hint: 'Можно пополнить баланс на минимальную сумму и проверить качество сервиса на практике.',
  },
  {
    label: 'Средняя цена',
    value: '≈ 30 ₽ / 100 ответов',
    hint: 'При обычной настройке контекста и правил ответы обходятся очень дёшево.',
  },
  {
    label: 'Тонкая настройка',
    value: 'от 15 ₽ / 100 ответов',
    hint: 'Чем чище и компактнее контекст, тем ниже стоимость обработки.',
  },
  {
    label: 'Доплата за автоответы',
    value: '0 ₽',
    hint: 'Нет отдельной платы за автоматический режим: хотите вручную, хотите автоматически.',
  },
];

const benefits = [
  'Живые ответы вместо сухих шаблонов и однотипных формулировок.',
  'Настройка тона, правил бренда, контекста товара и типовых спорных ситуаций.',
  'Ручной и автоматический режим без подключения к вашему кабинету и без передачи доступов.',
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
    subtitle: 'Для полной автоматизации через Seller API Ozon',
    text:
      'Этот сценарий подходит тем, у кого подключён Ozon Premium Plus. Можно создать отдельный API-ключ только с доступом к отзывам, и тогда ответы будут обрабатываться автоматически из кабинета Finerox без постоянно открытого браузера.',
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
      'Ручной и автоматический режим через расширение позволяют начать без доступа к кабинету, без передачи учётных данных и без сложной интеграции.',
  },
];

type ComparisonExample = {
  title: string;
  product: string;
  scenario: string;
  review: string;
  marketplaceReply: string;
  fineroxReply: string;
  marketplaceWeaknesses: string[];
  fineroxStrengths: string[];
};

const comparisonExamples: ComparisonExample[] = [
  {
    title: 'Мультитул KR301',
    product: 'KaiRox KR301',
    scenario: 'Положительный отзыв',
    review:
      'Муж в восторге. Многофункциональная штука. Отвёртка фиксируется. Ножницы острые. Заклепки звёздочки можно подтянуть при желании, есть отвёртка.',
    marketplaceReply:
      'Рады вас видеть! Спасибо за отзыв — ценим ваш опыт. Ваш муж остался в восторге от мультитула KaiRox KR301, что очень радует — многофункциональность действительно является одним из его ключевых преимуществ. Отдельно приятно, что он оценил такие детали, как фиксирующаяся отвёртка и острые ножницы, которые сделают его работу ещё более эффективной. Кроме того, возможность подтянуть заклёпки звёздочки при помощи имеющейся отвёртки добавляет ему универсальности.',
    fineroxReply:
      'Здорово, что мультитул KaiRox так понравился и подошёл в деле. И да, вы верно подметили момент со «звёздочками» — в комплект к KR301 мы специально кладём два ключа Torx, чтобы при необходимости можно было в любой момент чуть подтянуть и подстроить механику под себя. Пусть муж пользуется с удовольствием — KR301 как раз и задуман как рабочий универсал на каждый день.',
    marketplaceWeaknesses: [
      'Сухой и затянутый тон',
      'Не показывает знание комплектации',
      'Много слов, мало пользы',
    ],
    fineroxStrengths: [
      'Учитывает реальную комплектацию',
      'Отвечает по сути отзыва',
      'Похоже на ответ живого менеджера',
    ],
  },
  {
    title: 'Водонепроницаемые носки KR683',
    product: 'KaiRox KR683',
    scenario: 'Положительный отзыв с проблемой после стирки',
    review:
      'Крутые носки! Испортил из после стирки в машине с горячей водой',
    marketplaceReply:
      'Приветствуем! Сожалеем о возникших неудобствах. Известно, что носки KaiRox KR683 могут быть чувствительны к высоким температурам стирки, поэтому такая реакция после машинной стирки с горячей водой, к сожалению, возможна.',
    fineroxReply:
      'Понимаем, как обидно, когда удачную вещь портит неудачная стирка. Для водонепроницаемых носков KaiRox KR683 лучше подходит только ручная стирка в прохладной воде до 40°C — так мембранный слой сохраняет свои свойства дольше.',
    marketplaceWeaknesses: [
      'Формально сочувствует, но не помогает',
      'Обтекаемая формулировка',
      'Нет нормальной подсказки, что делать дальше',
    ],
    fineroxStrengths: [
      'Есть полезная рекомендация',
      'Понятно объясняет причину',
      'Звучит спокойно и по-человечески',
    ],
  },
  {
    title: 'Набор скальпелей для мультитула KR30 / DL30',
    product: 'KaiRox KR30 / Daicamping DL30',
    scenario: 'Отзыв про совместимость',
    review:
      'Не знаю под какой мультитул, но под лезерман сурж, придётся доработать напильником.',
    marketplaceReply:
      'Здравствуйте, уважаемый покупатель! Нам жаль, что набор скальпелей для мультитула KAIROX KR30 / DAICAMPING DL30 требует доработки под ваш инструмент. Интересно, что он подходит к лезерман сурж, хотя и потребуется корректировка при помощи напильника. Спасибо за отзыв!',
    fineroxReply:
      'Понимаем вас. Этот набор рассчитан именно на KaiRox KR30 и его крепление под T-образные хвостовики, поэтому с другими мультитулами, включая Leatherman Surge, посадка может отличаться.',
    marketplaceWeaknesses: [
      'Странный и неестественный тон',
      'Фактически оправдывает доработку напильником',
      'Не объясняет реальную совместимость',
    ],
    fineroxStrengths: [
      'Не обещает лишнего',
      'Чётко объясняет ограничение товара',
      'Корректно закрывает спорную ситуацию',
    ],
  },
];

const faq = [
  {
    q: 'Нужно ли давать доступ к моему кабинету маркетплейса?',
    a: 'Для ручной и автоматической генерации через расширение — нет. Вы ничего не передаёте, не создаёте менеджера и не открываете лишние доступы. Для API-режима используется только доступ к отзывам, если у вас уже есть подписка OZON Premium Plus.',
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
    a: 'Да. Это один из базовых сценариев: сначала настраиваете и проверяете качество вручную, затем при необходимости включаете автоматический режим через расширение без каких-либо доплат, либо, если у вас есть подписка OZON Premium Plus, можно настроить интеграцию по API.',
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
            <div className="text-xs uppercase tracking-[0.24em] text-amber-300/80">
              FINEROX
            </div>
            <div className="mt-1 text-sm text-slate-300">
              AI-автоответы на отзывы для продавцов маркетплейсов
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/login"
              className={getButtonClassName('secondary', 'px-4 py-2')}
            >
              Войти
            </Link>
            <Link
              href="/register"
              className={getButtonClassName('primary', 'px-5 py-2')}
            >
              Зарегистрироваться
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1280px] px-6 pb-10 pt-14">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm text-amber-100">
              Для продавцов, которым нужны живые ответы на отзывы, а не дорогая
              подписка и шаблонные фразы
            </div>

            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
                Finerox помогает отвечать на отзывы на маркетплейсах живо,
                быстро и в разы дешевле дорогих подписок
              </h1>

              <p className="max-w-3xl text-lg leading-8 text-slate-300">
                Я сам продавец на маркетплейсах и делал этот сервис в первую
                очередь для себя и таких же продавцов, которым нужно не просто
                “закрыть обязанность отвечать”, а действительно поддерживать
                карточку товара качественными и уместными ответами. Finerox
                умеет работать вручную, через расширение и в автоматических
                сценариях — без лишней абонентской нагрузки и без ненужных
                доступов к вашему кабинету.
              </p>

              <p className="max-w-3xl text-base leading-7 text-slate-400">
                Сервис не гонится за тем, чтобы навязать подписку. Логика
                простая: вы пополняете баланс, тестируете качество, настраиваете
                контекст, а дальше используете ручной режим или автоматизацию
                так, как удобно именно вам.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/login"
                className={getButtonClassName('primary', 'px-6 py-3 text-base')}
              >
                Попробовать сервис
              </Link>
              <Link
                href="#how-it-works"
                className={getButtonClassName(
                  'secondary',
                  'px-6 py-3 text-base',
                )}
              >
                Как это работает
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/10 backdrop-blur"
                >
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    {item.label}
                  </div>
                  <div className="mt-3 text-3xl font-semibold text-white">
                    {item.value}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-slate-400">
                    {item.hint}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur">
            <div className="text-lg font-semibold text-white">
              Что вы получаете на старте
            </div>

            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
                Ручной режим через расширение — наш сервис работает без доступа к
                кабинету и без передачи учётных данных.
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
                Автоматический режим через расширение — для тех, кто хочет
                экономить время и не отвечать на отзывы вручную по одному.
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
                API-сценарий — если у вас подключён Ozon Premium Plus
                (24 990 ₽ в месяц), можно настроить работу через Seller API Ozon
                и создать отдельный API-ключ только с доступом к отзывам. Тогда
                ответы будут автоматически обрабатываться без вашего участия.
              </div>
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-emerald-100">
                Пополнение от 10 ₽. Можно протестировать качество без серьёзных
                затрат и без привязки к подписке.
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
              <div className="text-sm font-medium text-amber-100">
                Что по безопасности
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-200">
                Для ручного и автоматического режима через расширение доступ к
                кабинету не нужен: не нужно создавать менеджера, передавать
                учётные данные или выдавать лишние права. Вы настраиваете
                информацию по товарам и пользуетесь сервисом. Доступ к Ozon
                нужен только для API-сценария — если у вас подключён Premium
                Plus и вы хотите полностью автоматизировать ответы без своего
                участия.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-6" id="benefits">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur">
          <div className="mb-4 text-2xl font-semibold text-white">
            Почему продавцы выбирают Finerox
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {benefits.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-4 text-sm leading-7 text-slate-200"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-6" id="how-it-works">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-semibold text-white">
              Три сценария работы
            </h2>
            <p className="mt-3 max-w-4xl text-base leading-7 text-slate-300">
              Вы можете начать с самого безопасного и простого режима, а потом
              перейти к автоматизации. Именно в такой последовательности
              большинству продавцов проще всего протестировать сервис и понять
              его ценность.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            {workflows.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur"
              >
                <div className="text-xl font-semibold text-white">
                  {item.title}
                </div>
                <div className="mt-2 text-sm text-amber-200">
                  {item.subtitle}
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  {item.text}
                </p>

                <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-slate-950/30 p-5">
                  <div className="text-sm font-medium text-white">
                    Здесь будет видео-презентация
                  </div>
                  <div className="mt-2 text-sm leading-6 text-slate-400">
                    После записи видео положите файл сюда:
                  </div>
                  <div className="mt-3 rounded-xl bg-slate-950/70 px-4 py-3 font-mono text-xs text-amber-100">
                    {item.videoPath}
                  </div>
                  <div className="mt-3 text-xs leading-6 text-slate-500">
                    Рекомендуемый формат: MP4, 1920×1080, H.264. Папка уже
                    создана:{' '}
                    <span className="font-mono">public/landing/videos/</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-6">
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur">
            <div>
              <h2 className="text-3xl font-semibold text-white">
                Сравнение на реальных отзывах
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-300">
                Ниже не абстрактные обещания, а реальные примеры. Один и тот же отзыв:
                слева — встроенный генератор маркетплейса, справа — ответ Finerox с
                учётом смысла отзыва, особенностей товара и нормального человеческого тона.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {comparisonExamples.map((item) => (
              <ComparisonCase key={item.title} item={item} />
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {comparePoints.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-4"
              >
                <div className="text-lg font-semibold text-white">
                  {item.title}
                </div>
                <div className="mt-2 text-sm leading-7 text-slate-300">
                  {item.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur">
          <h2 className="text-3xl font-semibold text-white">
            Кому подходит сервис
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <PersonaCard title="Тем, кто хочет протестировать без риска">
              Пополнение от 10 ₽, ручной режим и никаких лишних доступов на
              старте.
            </PersonaCard>
            <PersonaCard title="Тем, кто устал отвечать одно и то же вручную">
              Автоматический режим через расширение снимает рутину и
              освобождает время.
            </PersonaCard>
            <PersonaCard title="Тем, кому важен тон бренда">
              Можно прописать правила, ограничения, сценарии и стиль ответов под
              ваш ассортимент.
            </PersonaCard>
            <PersonaCard title="Тем, кто не хочет переплачивать">
              Оплата идёт только за использование, без обязательной ежемесячной
              подписки.
            </PersonaCard>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur">
          <h2 className="text-3xl font-semibold text-white">Частые вопросы</h2>
          <div className="mt-6 space-y-4">
            {faq.map((item) => (
              <details
                key={item.q}
                className="rounded-2xl border border-white/10 bg-slate-950/30 px-5 py-4"
              >
                <summary className="cursor-pointer list-none text-lg font-semibold text-white">
                  {item.q}
                </summary>
                <div className="mt-3 text-sm leading-7 text-slate-300">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 pb-16 pt-6">
        <div className="rounded-3xl border border-amber-300/20 bg-gradient-to-r from-amber-100 via-amber-200 to-orange-200 p-8 text-slate-950 shadow-[0_8px_24px_rgba(251,191,36,0.18)]">
          <div className="max-w-4xl">
            <div className="text-sm font-medium uppercase tracking-[0.2em] text-slate-700">
              Finerox
            </div>
            <h2 className="mt-3 text-3xl font-semibold">
              Попробуйте сервис на небольшой сумме и сами сравните качество
              ответов
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-800">
              Не нужно покупать подписку ради теста. Пополните баланс, настройте
              правила, проверьте ручной и автоматический режим.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/register"
                className={getButtonClassName('primary', 'px-6 py-3 text-base')}
              >
                Зарегистрироваться
              </Link>
              <Link
                href="/dashboard"
                className={getButtonClassName(
                  'secondary',
                  'px-6 py-3 text-base',
                )}
              >
                Личный кабинет
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ComparisonCase({ item }: { item: ComparisonExample }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-amber-100">
          {item.title}
        </span>
        <span className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-1 text-xs text-slate-300">
          {item.product}
        </span>
        <span className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-1 text-xs text-slate-300">
          {item.scenario}
        </span>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/40 p-5">
        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
          Отзыв покупателя
        </div>
        <p className="mt-3 text-sm leading-7 text-slate-200">{item.review}</p>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <ResponseCard
          tone="marketplace"
          title="Встроенный генератор маркетплейса"
          subtitle="Формально, многословно, местами мимо смысла"
          text={item.marketplaceReply}
          bullets={item.marketplaceWeaknesses}
        />
        <ResponseCard
          tone="finerox"
          title="Ответ Finerox"
          subtitle="Живо, уместно и с пониманием товара"
          text={item.fineroxReply}
          bullets={item.fineroxStrengths}
        />
      </div>
    </div>
  );
}

function ResponseCard({
  tone,
  title,
  subtitle,
  text,
  bullets,
}: {
  tone: 'marketplace' | 'finerox';
  title: string;
  subtitle: string;
  text: string;
  bullets: string[];
}) {
  const cardClass =
    tone === 'finerox'
      ? 'border-emerald-400/20 bg-emerald-500/10'
      : 'border-rose-400/15 bg-rose-500/10';

  const badgeClass =
    tone === 'finerox'
      ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
      : 'border-rose-300/20 bg-rose-300/10 text-rose-100';

  return (
    <div className={`rounded-2xl border p-5 ${cardClass}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-white">{title}</div>
          <div className="mt-1 text-sm text-slate-300">{subtitle}</div>
        </div>
        <div className={`rounded-full border px-3 py-1 text-xs ${badgeClass}`}>
          {tone === 'finerox' ? 'Сильнее по смыслу' : 'Слабее по подаче'}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
        <div className="text-sm leading-7 text-slate-100">{text}</div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {bullets.map((bullet) => (
          <span
            key={bullet}
            className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-1 text-xs text-slate-200"
          >
            {bullet}
          </span>
        ))}
      </div>
    </div>
  );
}

function PersonaCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-4">
      <div className="text-lg font-semibold text-white">{title}</div>
      <div className="mt-2 text-sm leading-7 text-slate-300">{children}</div>
    </div>
  );
}
