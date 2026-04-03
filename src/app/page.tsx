import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { getButtonClassName } from '@/components/ui/button';
import { PublicFooter } from '@/components/site/public-footer';

export const metadata: Metadata = {
  title: 'SellerReply — AI-сервис для работы с отзывами',
  description:
    'SellerReply — AI-сервис для работы с отзывами: ручная генерация, API-интеграции, подключение сайтов, маркетплейсов, CRM и 1С.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SellerReply — AI-сервис для работы с отзывами',
    description:
      'Ручная генерация, API-ключи, интеграции с сайтами, маркетплейсами, CRM и 1С.',
    url: 'https://sellerreply.ru',
  },
};

const stats = [
  {
    label: 'Быстрый старт',
    value: 'от 10 ₽',
    hint: 'Можно пополнить баланс на небольшую сумму и спокойно проверить сервис на практике.',
  },
  {
    label: 'API-ключи',
    value: 'для интеграций',
    hint: 'Подключайте свои системы и передавайте отзывы в обработку по API.',
  },
  {
    label: 'Юрлица и ИП',
    value: 'Оплата по счёту',
    hint: 'Работаем с юрлицами и ИП, принимаем безналичную оплату и закрывающие документы.',
  },
  {
    label: 'Интеграции',
    value: 'сайт, CRM, 1С',
    hint: 'Сервис можно встроить в ваш сайт, CRM-систему, 1С и другие рабочие процессы.',
  },
];

const benefits = [
  'Живые ответы вместо сухих шаблонов и однотипных формулировок.',
  'Ручная генерация и API-сценарии в одном сервисе.',
  'Подключение сайтов, маркетплейсов, CRM, 1С и других систем.',
  'Настройка общего тона, правил проекта и отдельных сценариев обработки.',
  'Только нужные доступы под выбранный сценарий интеграции.',
  'Оплата по фактическому использованию без обязательной подписки.',
];

const workflows = [
  {
    title: 'Ручная генерация ответов',
    subtitle: 'Для старта, проверки качества и быстрой работы',
    text:
      'Вы передаёте отзыв в сервис и получаете готовый вариант ответа с учётом смысла текста, заданного тона и правил проекта. Это удобно для ручной работы, тестирования и настройки качества.',
    videoPath: '/public/landing/videos/manual-mode.mp4',
  },
  {
    title: 'Подключение по API',
    subtitle: 'Для сайтов, маркетплейсов и внешних систем',
    text:
      'Если у вашей системы есть API или возможность передавать отзывы в обработку, SellerReply можно подключить в рабочий контур и автоматизировать генерацию ответов без ручной рутины.',
    videoPath: '/public/landing/videos/api-mode.mp4',
  },
  {
    title: 'Внедрение в свои процессы',
    subtitle: 'Для CRM, 1С и внутренних решений',
    text:
      'Сервис можно использовать как отдельный слой генерации ответов и встраивать в CRM, 1С, панели операторов и другие внутренние инструменты, где нужно работать с отзывами и обратной связью.',
    videoPath: '/public/landing/videos/integration-mode.mp4',
  },
];

const comparePoints = [
  {
    title: 'Почему ответы выглядят живее',
    text:
      'SellerReply строит ответ не только по самому тексту, но и по вашим правилам, тону проекта, данным об объекте и логике обработки. Поэтому ответы звучат ближе к живому общению.',
  },
  {
    title: 'Почему сервис удобно внедрять',
    text:
      'Можно начать с ручной генерации, а затем перейти к API-сценариям и встроить сервис в сайт, маркетплейс, CRM или 1С без полной перестройки процессов.',
  },
  {
    title: 'Почему проще контролировать стоимость',
    text:
      'Вы регулируете расход через длину промтов, выбранную модель и состав передаваемых данных. Это позволяет подстроить стоимость под ваш сценарий работы.',
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
    q: 'Для каких систем подходит SellerReply?',
    a: 'SellerReply можно использовать для сайтов, маркетплейсов, CRM, 1С и других систем, где отзывы или обращения можно передавать в обработку вручную или по API.',
  },
  {
    q: 'Можно ли подключить сервис по API?',
    a: 'Да. У сервиса есть работа по API-ключам, поэтому его можно подключать к своим проектам и использовать как отдельный слой генерации ответов.',
  },
  {
    q: 'Нужно ли давать полный доступ к системе?',
    a: 'Нет. Доступ к вашей системе нам не нужен. Для работы с SellerReply мы выдаём вам API-ключ, по которому вы сами отправляете данные на обработку. Если подключение идёт к внешним сервисам, которые сами выдают API-доступ к отзывам, тогда используется только тот доступ, который нужен для получения этих отзывов, например с маркетплейса.',
  },
  {
    q: 'Сколько стоит генерация?',
    a: 'Стоимость зависит от количества передаваемого текста, длины промтов, выбранной модели ИИ и настроек обработки. При аккуратной настройке сильная модель может работать примерно от 1 ₽ за одну генерацию, а итоговая стоимость регулируется составом промтов и объемом контекста.',
  },
  {
    q: 'Можно ли сначала работать вручную, а потом подключить API?',
    a: 'Да. Это один из базовых сценариев: сначала вы проверяете качество вручную, настраиваете логику ответов, а затем подключаете сервис к своим системам по API.',
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
              SELLERREPLY
            </div>
            <div className="mt-1 text-sm text-slate-300">
              SellerReply — AI-сервис для работы с отзывами
            </div>
            <div className="mt-1 text-xs text-slate-400">
              API, интеграции и живой тон ответов.
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
              Для сайтов, маркетплейсов, CRM, 1С и других систем
            </div>

            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
                SellerReply — сервис для работы с отзывами, ручной генерации и
                API-интеграций
              </h1>

              <p className="max-w-3xl text-lg leading-8 text-slate-300">
                SellerReply помогает генерировать ответы на отзывы и
                обратную связь с помощью обученного искусственного интеллекта в
                удобном для вас формате: вручную, по API или через встраивание в
                свои процессы. Сервис подходит для внешних площадок и внутренних
                систем, где важны скорость, единый тон и предсказуемое качество
                ответов.
              </p>

              <p className="max-w-3xl text-base leading-7 text-slate-400">
                Вы можете использовать SellerReply как отдельный рабочий
                инструмент или подключить его к сайту, маркетплейсу, CRM,
                1С и другим системам, если в них есть возможность передавать
                отзывы и обращения в обработку.
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
                  className="flex h-full min-h-[230px] flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/10 backdrop-blur"
                >
                  <div className="text-[11px] uppercase tracking-[0.22em] leading-5 text-slate-500">
                    {item.label}
                  </div>
                  <div className="mt-4 text-[2rem] font-semibold leading-[1.05] text-white">
                    {item.value}
                  </div>
                  <div className="mt-4 text-sm leading-6 text-slate-400">
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
                Ручную генерацию ответов — для быстрого старта, проверки
                качества и настройки логики обработки.
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
                Гибкие правила проекта — тон, сценарии, исключения, подсказки
                и другие параметры под вашу задачу.
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
                API-сценарии — для сайтов, маркетплейсов, CRM, 1С и других
                систем, где отзывы можно передавать в обработку.
              </div>
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-emerald-100">
                Пополнение от 10 ₽. Можно протестировать сервис без длинного
                входа и лишних расходов.
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
              <div className="text-sm font-medium text-amber-100">
                Что по доступам
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-200">
                Для работы с SellerReply мы выдаём вам API-ключ, по которому вы
                отправляете данные в сервис на обработку. Если отзывы нужно
                получать из внешней системы, тогда подключается только тот
                API-доступ, который нужен для чтения этих отзывов и передачи их
                в SellerReply.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-6" id="benefits">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur">
          <div className="mb-4 text-2xl font-semibold text-white">
            Почему выбирают SellerReply
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
              Можно начать с ручной генерации, затем настроить правила и
              подключить SellerReply к своему сайту, CRM, 1С, маркетплейсу
              или другой системе через API.
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
                  <div className="mt-4 text-sm leading-6 text-slate-400">
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
                Ниже не абстрактные обещания, а реальные примеры. Один и тот же
                отзыв: слева — встроенный генератор маркетплейса, справа —
                ответ SellerReply с учётом смысла отзыва, особенностей товара и
                нормального человеческого тона.
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
            <PersonaCard title="Тем, кто хочет проверить качество без риска">
              Пополнение от 10 ₽, ручной запуск и понятный старт без сложного
              внедрения.
            </PersonaCard>
            <PersonaCard title="Тем, кому важен единый тон ответов">
              Можно задать общие правила, стиль и сценарии обработки под ваш
              проект или команду.
            </PersonaCard>
            <PersonaCard title="Тем, кто работает в своих системах">
              SellerReply можно подключать к сайту, CRM, 1С и другим внутренним
              инструментам через API.
            </PersonaCard>
            <PersonaCard title="Тем, кто хочет масштабировать обработку отзывов">
              Сервис подходит и для ручной работы, и для поточного сценария
              через интеграции.
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
              SellerReply
            </div>
            <h2 className="mt-3 text-3xl font-semibold">
              Подключайте SellerReply как отдельный сервис или встраивайте в
              свои системы
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-800">
              Используйте ручную генерацию, настраивайте правила, подключайте
              API и внедряйте сервис в сайт, маркетплейс, CRM, 1С или другой
              рабочий контур.
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
      <PublicFooter />
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
        <div className="text-[11px] uppercase tracking-[0.22em] leading-5 text-slate-500">
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
          title="Ответ SellerReply"
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
