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
  object: string;
  scenario: string;
  review: string;
  templateReply: string;
  serviceReply: string;
  templateWeaknesses: string[];
  serviceStrengths: string[];
};

const comparisonExamples: ComparisonExample[] = [
  {
    title: 'Интернет-магазин электроники',
    object: 'Беспроводные наушники',
    scenario: 'Положительный отзыв',
    review:
      'Звук хороший, быстро подключились, микрофон тоже нормальный. За свою цену вообще отлично.',
    templateReply:
      'Здравствуйте! Спасибо за ваш отзыв. Мы очень рады, что вам понравился товар. Желаем приятного использования и будем рады видеть вас снова.',
    serviceReply:
      'Отлично, что наушники порадовали и по звуку, и по подключению. Особенно приятно, когда вещь нормально работает сразу из коробки и не требует лишней возни.',
    templateWeaknesses: [
      'Шаблонно',
      'Без привязки к смыслу',
      'Похоже на автоответ',
    ],
    serviceStrengths: [
      'Реагирует на суть отзыва',
      'Звучит живее',
      'Без лишней воды',
    ],
  },
  {
    title: 'Сайт услуг',
    object: 'Клининговая услуга',
    scenario: 'Нейтральный отзыв',
    review:
      'В целом убрались хорошо, но опоздали почти на 20 минут. Это не критично, но неприятно.',
    templateReply:
      'Спасибо за ваш отзыв. Мы обязательно учтем ваши замечания и постараемся улучшить качество обслуживания.',
    serviceReply:
      'Понимаем вас: когда специалист задерживается, это сбивает планы, даже если сама работа потом выполнена нормально. Спасибо, что отдельно отметили качество уборки — замечание по опозданию точно стоит учесть.',
    templateWeaknesses: [
      'Слишком формально',
      'Нет нормальной реакции',
      'Не раскрывает ситуацию',
    ],
    serviceStrengths: [
      'Есть нормальная эмпатия',
      'Сохраняет деловой тон',
      'Подходит под сервисный бизнес',
    ],
  },
  {
    title: 'CRM / внутренний контур',
    object: 'Товар с частыми вопросами',
    scenario: 'Отзыв с проблемой',
    review:
      'Сам товар нормальный, но в комплекте не сразу понял, как это подключать. Инструкция слишком короткая.',
    templateReply:
      'Здравствуйте! Благодарим за обратную связь. Нам жаль, что возникли неудобства. Мы обязательно передадим информацию коллегам.',
    serviceReply:
      'Поняли вас. Когда инструкция слишком краткая, даже нормальный товар начинает раздражать в первые минуты. Такой отзыв как раз полезен для доработки подсказок и карточки товара.',
    templateWeaknesses: [
      'Сухо',
      'Без конкретики',
      'Не помогает по смыслу',
    ],
    serviceStrengths: [
      'Понимает контекст проблемы',
      'Подходит для рабочих сценариев',
      'Смотрится как ручной ответ',
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
    a: 'Нет. Для ручной работы доступы не нужны. Для интеграции по API нужен только тот доступ, который относится к передаче отзывов и обработке ответов в рамках вашего сценария.',
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
                SellerReply помогает генерировать ответы на отзывы и обратную
                связь в удобном для вас формате: вручную, по API или через
                встраивание в свои процессы. Сервис подходит для внешних
                площадок и внутренних систем, где важны скорость, единый тон и
                предсказуемое качество ответов.
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
                Для ручной работы доступы не нужны. Для интеграций используются
                только те данные и права API, которые нужны для передачи
                отзывов и генерации ответов в рамках вашего сценария.
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
                Сравнение на реальных примерах
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-300">
                Ниже показана разница между шаблонным ответом и ответом,
                сформированным через SellerReply с учётом смысла текста,
                логики обработки и нормального живого тона.
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
          {item.object}
        </span>
        <span className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-1 text-xs text-slate-300">
          {item.scenario}
        </span>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/40 p-5">
        <div className="text-[11px] uppercase tracking-[0.22em] leading-5 text-slate-500">
          Исходный отзыв
        </div>
        <p className="mt-3 text-sm leading-7 text-slate-200">{item.review}</p>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <ResponseCard
          tone="template"
          title="Шаблонный ответ"
          subtitle="Сухо, формально и без нормальной реакции на смысл"
          text={item.templateReply}
          bullets={item.templateWeaknesses}
        />
        <ResponseCard
          tone="service"
          title="Ответ SellerReply"
          subtitle="Живо, уместно и ближе к реальной коммуникации"
          text={item.serviceReply}
          bullets={item.serviceStrengths}
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
  tone: 'template' | 'service';
  title: string;
  subtitle: string;
  text: string;
  bullets: string[];
}) {
  const cardClass =
    tone === 'service'
      ? 'border-emerald-400/20 bg-emerald-500/10'
      : 'border-rose-400/15 bg-rose-500/10';

  const badgeClass =
    tone === 'service'
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
          {tone === 'service' ? 'Сильнее по смыслу' : 'Слабее по подаче'}
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
