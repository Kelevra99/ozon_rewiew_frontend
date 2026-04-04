import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';

const API_BASE = 'https://api.sellerreply.ru/v1';

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm leading-6 text-amber-100">
      <code>{children}</code>
    </pre>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <div className="space-y-4">
        <div className="text-xl font-semibold text-white">{title}</div>
        <div className="space-y-3 text-sm leading-7 text-slate-300">{children}</div>
      </div>
    </Card>
  );
}

export default function ApiDocsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="API документация"
        description="Подключайте SellerReply к своим CRM, сайтам, 1С и другим сервисам. Ниже описан текущий рабочий контракт API для проверки ключа, генерации ответа и фиксации результата обработки."
      />

      <Section title="1. Базовый URL API">
        <p>Все запросы отправляются на базовый URL:</p>
        <CodeBlock>{API_BASE}</CodeBlock>
        <p>
          Во всех примерах ниже уже используется этот адрес. Для внешней интеграции
          нужен именно API-ключ SellerReply формата <span className="rounded bg-white/10 px-2 py-1 font-mono text-amber-200">sk_user_xxx</span>.
        </p>
      </Section>

      <Section title="2. Авторизация">
        <p>
          API-ключ передаётся в заголовке:
        </p>
        <CodeBlock>{`Authorization: Bearer sk_user_xxx`}</CodeBlock>
        <p>
          Такой ключ создаётся в кабинете на странице «API ключи». Именно его можно
          использовать в своей CRM, 1С, сайте, интеграционном модуле или внутреннем сервисе.
        </p>
      </Section>

      <Section title="3. Проверка API-ключа">
        <p>
          Перед началом работы можно проверить, что API-ключ валиден и активен.
        </p>

        <CodeBlock>{`curl -X POST '${API_BASE}/extension/auth/check' \\
  -H 'Authorization: Bearer sk_user_xxx' \\
  -H 'Accept: application/json'`}</CodeBlock>

        <p>Пример успешного ответа:</p>

        <CodeBlock>{`{
  "valid": true,
  "user": {
    "id": "clx_user_id",
    "email": "user@example.com",
    "name": "Юрий"
  },
  "defaults": {
    "tonePreset": "friendly",
    "toneNotes": "..."
  },
  "limits": {
    "mode": ["standard", "advanced", "expert"]
  }
}`}</CodeBlock>
      </Section>

      <Section title="4. Генерация ответа">
        <p>
          Основной endpoint для интеграции:
        </p>

        <CodeBlock>{`POST ${API_BASE}/replies/generate`}</CodeBlock>

        <p>Минимально обязательные поля:</p>

        <CodeBlock>{`{
  "reviewExternalId": "crm_review_12345",
  "marketplace": "ozon",
  "rating": 5
}`}</CodeBlock>

        <p>Полный пример запроса:</p>

        <CodeBlock>{`curl -X POST '${API_BASE}/replies/generate' \\
  -H 'Authorization: Bearer sk_user_xxx' \\
  -H 'Content-Type: application/json' \\
  -H 'Accept: application/json' \\
  -d '{
    "reviewExternalId": "crm_review_12345",
    "marketplace": "ozon",
    "productName": "KaiRox KR30",
    "productMeta": {
      "article": "KR30",
      "sku": "KR30",
      "offerId": "KR30"
    },
    "rating": 5,
    "reviewText": "Мультитул отличный, ножницы острые, всё понравилось.",
    "reviewDate": "2026-04-04",
    "authorName": "Покупатель",
    "mode": "expert",
    "pageUrl": "https://example.com/review/12345",
    "domContext": {
      "article": "KR30",
      "orderNumber": "123456789"
    }
  }'`}</CodeBlock>

        <p>Пример ответа:</p>

        <CodeBlock>{`{
  "reviewLogId": "clx_review_log_id",
  "generatedReply": "Рады, что мультитул хорошо показал себя в деле...",
  "matchedProduct": {
    "matched": true,
    "confidence": 1,
    "productId": "clx_product_id",
    "productName": "KaiRox KR30",
    "article": "KR30"
  },
  "model": "gpt-4.1-mini",
  "tokenUsage": {
    "promptTokens": 1420,
    "completionTokens": 118,
    "totalTokens": 1538
  },
  "warnings": [],
  "canAutopost": true,
  "billing": {
    "chargedMinor": 84,
    "chargedRub": 0.84,
    "balanceAfterMinor": 15316
  }
}`}</CodeBlock>
      </Section>

      <Section title="5. Описание полей запроса">
        <p>
          <span className="font-medium text-white">reviewExternalId</span> — обязательный внешний ID
          отзыва или задачи в вашей системе. Желательно передавать уникальное значение.
        </p>

        <p>
          <span className="font-medium text-white">marketplace</span> — обязательное строковое поле.
          Здесь можно передавать не только маркетплейс, но и любой источник, например:
          <span className="mx-1 rounded bg-white/10 px-2 py-1 font-mono text-amber-200">ozon</span>,
          <span className="mx-1 rounded bg-white/10 px-2 py-1 font-mono text-amber-200">wildberries</span>,
          <span className="mx-1 rounded bg-white/10 px-2 py-1 font-mono text-amber-200">yandex_market</span>,
          <span className="mx-1 rounded bg-white/10 px-2 py-1 font-mono text-amber-200">site</span>,
          <span className="mx-1 rounded bg-white/10 px-2 py-1 font-mono text-amber-200">crm</span>.
        </p>

        <p>
          <span className="font-medium text-white">productName</span> — название товара или объекта,
          по которому идёт отзыв.
        </p>

        <p>
          <span className="font-medium text-white">productMeta</span> — дополнительный объект с метаданными.
          Самые полезные поля:
          <span className="mx-1 rounded bg-white/10 px-2 py-1 font-mono text-amber-200">article</span>,
          <span className="mx-1 rounded bg-white/10 px-2 py-1 font-mono text-amber-200">sku</span>,
          <span className="mx-1 rounded bg-white/10 px-2 py-1 font-mono text-amber-200">offerId</span>.
          Если передавать артикул, шанс точного совпадения с товаром в базе выше.
        </p>

        <p>
          <span className="font-medium text-white">rating</span> — обязательная оценка от 1 до 5.
        </p>

        <p>
          <span className="font-medium text-white">reviewText</span> — текст отзыва. Если текста нет,
          поле можно не передавать.
        </p>

        <p>
          <span className="font-medium text-white">reviewDate</span> — дата отзыва в строковом виде.
        </p>

        <p>
          <span className="font-medium text-white">authorName</span> — имя автора отзыва.
        </p>

        <p>
          <span className="font-medium text-white">existingSellerReply</span> — уже существующий ответ,
          если его нужно учитывать в вашем сценарии.
        </p>

        <p>
          <span className="font-medium text-white">mode</span> — уровень модели:
          <span className="mx-1 rounded bg-white/10 px-2 py-1 font-mono text-amber-200">standard</span>,
          <span className="mx-1 rounded bg-white/10 px-2 py-1 font-mono text-amber-200">advanced</span>,
          <span className="mx-1 rounded bg-white/10 px-2 py-1 font-mono text-amber-200">expert</span>.
        </p>

        <p>
          <span className="font-medium text-white">pageUrl</span> — адрес страницы, если он есть.
        </p>

        <p>
          <span className="font-medium text-white">domContext</span> — дополнительный объект с произвольным контекстом,
          если вы хотите передать артикул, номер заказа, ссылку, свойства карточки и другие данные.
        </p>
      </Section>

      <Section title="6. Передача результата обработки">
        <p>
          История генераций, токены, стоимость и списание баланса фиксируются автоматически
          уже в момент запроса на генерацию. Отдельный запрос ниже не нужен для создания истории —
          он нужен только для того, чтобы обновить финальный статус уже созданной записи,
          если ваша система сама вставляет ответ, публикует его или хочет отметить итог обработки.
        </p>

        <CodeBlock>{`POST ${API_BASE}/replies/result`}</CodeBlock>

        <p>Пример запроса:</p>

        <CodeBlock>{`curl -X POST '${API_BASE}/replies/result' \\
  -H 'Content-Type: application/json' \\
  -H 'Accept: application/json' \\
  -d '{
    "reviewLogId": "clx_review_log_id",
    "status": "posted",
    "finalReply": "Рады, что мультитул хорошо показал себя в деле..."
  }'`}</CodeBlock>

        <p>Допустимые значения поля status:</p>

        <CodeBlock>{`inserted
posted
skipped
failed
canceled`}</CodeBlock>
      </Section>

      <Section title="7. Типовой сценарий интеграции">
        <p>1. Создаёте API-ключ SellerReply в кабинете.</p>
        <p>2. Сохраняете этот ключ в своей CRM, 1С, сайте или внутреннем сервисе.</p>
        <p>
          3. При появлении нового отзыва отправляете данные на
          <span className="mx-1 rounded bg-white/10 px-2 py-1 font-mono text-amber-200">/replies/generate</span>.
        </p>
        <p>
          4. Получаете готовый текст ответа, токены, стоимость в рублях и актуальный баланс после списания.
          Это тот же самый баланс, который используется в разделе «Баланс» в кабинете SellerReply.
        </p>
        <p>5. При необходимости публикуете ответ у себя или на внешней площадке.</p>
        <p>
          6. Если хотите вести историю статусов в SellerReply, отправляете итог на
          <span className="mx-1 rounded bg-white/10 px-2 py-1 font-mono text-amber-200">/replies/result</span>.
        </p>
      </Section>

      <Section title="8. Важные замечания">
        <p>
          Чем точнее вы передаёте данные по товару, особенно артикул или SKU, тем лучше
          SellerReply подтягивает внутренний контекст товара и правила ответа.
        </p>
        <p>
          Стоимость генерации зависит от длины входных данных, выбранного режима модели
          и объёма контекста.
        </p>
        <p>
          Для внешних интеграций используйте именно API-ключ SellerReply, а не токен кабинета.
        </p>
      </Section>
    </div>
  );
}
