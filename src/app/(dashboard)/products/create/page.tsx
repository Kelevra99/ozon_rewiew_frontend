'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProductItem } from '@/types/api';
import { apiFetch } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorAlert } from '@/components/ui/error-alert';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { Textarea } from '@/components/ui/textarea';

type ProductForm = {
  name: string;
  article: string;
  brand: string;
  model: string;
  kit: string;
  annotation: string;
  productRules: string;
  extra1Name: string;
  extra1Value: string;
  extra2Name: string;
  extra2Value: string;
};

function emptyForm(): ProductForm {
  return {
    name: '',
    article: '',
    brand: '',
    model: '',
    kit: '',
    annotation: '',
    productRules: '',
    extra1Name: '',
    extra1Value: '',
    extra2Name: '',
    extra2Value: '',
  };
}

function normalizePayload(form: ProductForm) {
  const name = form.name.trim();
  if (!name) {
    throw new Error('Название товара обязательно');
  }

  const articleRaw = form.article.trim();
  if (!articleRaw) {
    throw new Error('Артикул товара обязателен');
  }

  const normalize = (value: string) => {
    const cleaned = value.trim();
    return cleaned.length ? cleaned : null;
  };

  return {
    name,
    article: articleRaw,
    brand: normalize(form.brand),
    model: normalize(form.model),
    kit: normalize(form.kit),
    annotation: normalize(form.annotation),
    productRules: normalize(form.productRules),
    extra1Name: normalize(form.extra1Name),
    extra1Value: normalize(form.extra1Value),
    extra2Name: normalize(form.extra2Name),
    extra2Value: normalize(form.extra2Value),
  };
}

export default function ProductCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState<ProductForm>(emptyForm());
  const [creating, setCreating] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');

  async function handleCreate() {
    setCreating(true);
    setErrorText('');
    setSuccessText('');

    try {
      const created = await apiFetch<ProductItem>('/products', {
        method: 'POST',
        auth: true,
        body: JSON.stringify(normalizePayload(form)),
      });

      setForm(emptyForm());
      setSuccessText(`Товар создан: ${created.name}`);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось создать товар');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Добавить товар"
        description="Создайте карточку вручную и задайте только те данные, которые реально нужны для ответов по товару."
        actions={
          <Button variant="secondary" onClick={() => router.push('/products')}>
            К списку товаров
          </Button>
        }
      />

      <Card>
        <div className="space-y-4 text-sm leading-6 text-slate-300">
          <div className="text-lg font-semibold text-white">Как это работает</div>

          <p>
            <span className="font-medium text-white">Общий тон ответов</span> теперь задаётся отдельно
            в разделе{' '}
            <Link href="/reply-tone" className="text-amber-300 underline underline-offset-4">
              «Тон ответов»
            </Link>.
            Его не нужно повторять при создании каждого товара.
          </p>

          <p>
            <span className="font-medium text-white">Специальные правила по товару</span> нужны для уточнений
            по конкретной карточке. Здесь удобно прописывать частые проблемы, важные ограничения, совместимость,
            типовые вопросы покупателей, а также то, что можно подчеркивать в ответах и чего нельзя обещать
            или утверждать.
          </p>

          <p>
            <span className="font-medium text-white">Аннотация</span> — это краткая рабочая выжимка о товаре.
            Сюда лучше вносить только ту информацию, которая действительно помогает отвечать на отзывы:
            ключевые характеристики, особенности использования, важные ограничения и отличия. Лишняя рекламная
            информация здесь не нужна.
          </p>
        </div>
      </Card>

      {errorText ? <ErrorAlert text={errorText} /> : null}
      {successText ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {successText}
        </div>
      ) : null}

      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Название товара" hint="Полное название карточки товара.">
            <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
          </Field>

          <Field label="Артикул" hint="Обязательное поле. Используется для точного сопоставления отзывов с товаром.">
            <Input value={form.article} onChange={(e) => setForm((prev) => ({ ...prev, article: e.target.value }))} />
          </Field>

          <Field label="Бренд" hint="Например: KaiRox.">
            <Input value={form.brand} onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value }))} />
          </Field>

          <Field label="Модель" hint="Если есть отдельное модельное обозначение.">
            <Input value={form.model} onChange={(e) => setForm((prev) => ({ ...prev, model: e.target.value }))} />
          </Field>

          <Field label="Комплектация" hint="Что входит в поставку товара.">
            <Input value={form.kit} onChange={(e) => setForm((prev) => ({ ...prev, kit: e.target.value }))} />
          </Field>

          <Field label="Название доп. поля 1" hint="Например: Инструменты, Совместимость, Материал.">
            <Input value={form.extra1Name} onChange={(e) => setForm((prev) => ({ ...prev, extra1Name: e.target.value }))} />
          </Field>

          <Field label="Значение доп. поля 1" hint="Полезное дополнительное свойство товара.">
            <Input value={form.extra1Value} onChange={(e) => setForm((prev) => ({ ...prev, extra1Value: e.target.value }))} />
          </Field>

          <Field label="Название доп. поля 2" hint="Ещё одно важное свойство товара.">
            <Input value={form.extra2Name} onChange={(e) => setForm((prev) => ({ ...prev, extra2Name: e.target.value }))} />
          </Field>

          <Field label="Значение доп. поля 2" hint="Например: Вес, Размер, Количество функций.">
            <Input value={form.extra2Value} onChange={(e) => setForm((prev) => ({ ...prev, extra2Value: e.target.value }))} />
          </Field>

          <div className="md:col-span-2">
            <Field
              label="Специальные правила по товару"
              hint="Ограничения, совместимость, типовые спорные ситуации и то, что можно или нельзя утверждать."
            >
              <Textarea value={form.productRules} onChange={(e) => setForm((prev) => ({ ...prev, productRules: e.target.value }))} />
            </Field>
          </div>

          <div className="md:col-span-2">
            <Field
              label="Аннотация"
              hint="Описание товара, которое используется как рабочий контекст для генерации."
            >
              <Textarea value={form.annotation} onChange={(e) => setForm((prev) => ({ ...prev, annotation: e.target.value }))} />
            </Field>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? 'Создаём...' : 'Добавить товар'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
