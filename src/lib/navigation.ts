import type { UserRole } from '@/types/api';

export type NavItem = {
  href: string;
  label: string;
  children?: NavItem[];
};

export const dashboardNav: NavItem[] = [
  { href: '/dashboard', label: 'Дашборд' },
  { href: '/reply-tone', label: 'Тон ответов' },
  {
    href: '/products',
    label: 'Товары',
    children: [
      { href: '/products/import', label: 'Импорт OZON' },
      { href: '/products/create', label: 'Добавить товар' },
    ],
  },
  { href: '/api-keys', label: 'API ключи' },
  {
    href: '/billing',
    label: 'Баланс',
    children: [
      { href: '/billing/payments', label: 'Платежи' },
      { href: '/billing/topup', label: 'Пополнение' },
    ],
  },
  { href: '/reviews', label: 'История отзывов' },
  { href: '/profile', label: 'Профиль' },
];

export const adminNav: NavItem[] = [
  { href: '/admin', label: 'Сводка' },
  { href: '/admin/users', label: 'Пользователи' },
  { href: '/admin/reviews', label: 'Генерации' },
  { href: '/admin/payments', label: 'Платежи' },
  { href: '/admin/exchange-rates', label: 'Курсы' },
  { href: '/admin/service-tiers', label: 'Service tiers' },
  { href: '/admin/prompt-logs', label: 'Prompt logs' },
  { href: '/admin/audit-logs', label: 'Audit logs' },
];

export function canAccessAdmin(role?: UserRole | null) {
  return role === 'admin' || role === 'superadmin';
}
