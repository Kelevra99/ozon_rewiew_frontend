import type { Metadata } from 'next';
import { LegalPageLayout } from '@/components/site/legal-page-layout';

export const metadata: Metadata = {
  title: 'Поддержка',
  description: 'Контакты поддержки сервиса SellerReply и порядок обращения по вопросам работы сервиса.',
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      <div className="space-y-3 text-slate-200">{children}</div>
    </section>
  );
}

export default function SupportPage() {
  return (
    <LegalPageLayout
      title="Поддержка"
      description="Если у вас возникли вопросы по работе сервиса, оплате, API-доступу или возврату, свяжитесь с поддержкой SellerReply."
      updatedAt="03.04.2026"
    >
      <Section title="Контакты">
        <p>
          Телефон:{' '}
          <a
            href="tel:+79102857815"
            className="text-amber-200 underline underline-offset-4"
          >
            +7 910 285-78-15
          </a>
        </p>
        <p>
          Email:{' '}
          <a
            href="mailto:nikonov.yuriy@gmail.com"
            className="text-amber-200 underline underline-offset-4"
          >
            nikonov.yuriy@gmail.com
          </a>
        </p>
        <p>
          Telegram:{' '}
          <a
            href="https://t.me/kairox_global"
            target="_blank"
            rel="noreferrer"
            className="text-amber-200 underline underline-offset-4"
          >
            @kairox_global
          </a>
        </p>
      </Section>

      <Section title="По каким вопросам можно обращаться">
        <p>— проблемы с регистрацией и доступом к кабинету;</p>
        <p>— вопросы по балансу, списаниям и оплате;</p>
        <p>— возвраты и спорные операции;</p>
        <p>— ручная генерация ответов;</p>
        <p>— работа API-доступа и интеграции;</p>
        <p>— технические ошибки и предложения по улучшению сервиса.</p>
      </Section>

      <Section title="Что лучше указать в обращении">
        <p>
          Чтобы мы быстрее помогли, желательно указать логин или email кабинета,
          краткое описание проблемы, дату и пример операции, а также приложить
          скриншот, если это помогает понять ситуацию.
        </p>
      </Section>

      <Section title="Возвраты">
        <p>
          По вопросам возврата вы можете написать на email, в Telegram или
          отправить обращение через форму в личном кабинете.
        </p>
        <p>
          Возвраты и спорные списания рассматриваются индивидуально. В обращении
          желательно указать причину запроса, дату платежа и описание ситуации.
        </p>
      </Section>

      <Section title="Оператор сервиса">
        <p>ИП Никонов Юрий Александрович</p>
        <p>ОГРНИП: 320366800086472</p>
        <p>ИНН: 026608318626</p>
        <p>Сервис: SellerReply</p>
      </Section>
    </LegalPageLayout>
  );
}
