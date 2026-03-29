'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';

export default function ProfileBreakPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Отдохнуть 2 минуты"
        description="Здесь позже появится мини-игра для короткой паузы между задачами."
        actions={
          <Link href="/profile">
            <Button variant="secondary">Вернуться в профиль</Button>
          </Link>
        }
      />

      <Card>
        <div className="space-y-4 text-sm leading-6 text-slate-300">
          <div className="text-lg font-semibold text-white">Скоро здесь будет мини-игра</div>
          <p>
            Эту страницу можно использовать как небольшую паузу между работой с отзывами, товарами и платежами.
          </p>
          <p>
            Дальше сюда можно добавить змейку, тетрис или другую простую игру прямо внутри кабинета.
          </p>
        </div>
      </Card>
    </div>
  );
}
