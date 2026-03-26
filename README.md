# OZON Auto Reply Frontend

Готовый frontend-кабинет под существующий backend OZON Auto Reply.

## Внутри уже есть

- Next.js App Router
- TypeScript
- Tailwind CSS
- устойчивый JWT auth-flow
- отдельная логика для кабинета и для admin
- API keys для расширения
- товары, импорт XLSX, billing, payments, reviews
- admin-разделы
- универсальный рендер DTO и JSON fallback, чтобы ничего не ломалось из-за мелких расхождений форматов

## Принцип авторизации

- JWT — только для frontend-кабинета
- `sk_user_xxx` — только для расширения
- frontend не использует `sk_user_xxx` как session token

## Запуск

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Адреса

- frontend: `http://localhost:3000`
- backend: `http://localhost:3001/v1`

## Маршруты

### Публичные
- `/login`
- `/register`

### Кабинет
- `/dashboard`
- `/products`
- `/products/import`
- `/api-keys`
- `/billing`
- `/billing/payments`
- `/billing/payments/[id]`
- `/billing/topup`
- `/reviews`
- `/reviews/[id]`
- `/profile`

### Admin
- `/admin`
- `/admin/users`
- `/admin/users/[id]`
- `/admin/reviews`
- `/admin/reviews/[id]`
- `/admin/payments`
- `/admin/payments/[id]`
- `/admin/exchange-rates`
- `/admin/service-tiers`
- `/admin/prompt-logs`
- `/admin/audit-logs`
