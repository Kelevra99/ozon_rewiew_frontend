'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';
import { toArray } from '@/lib/data';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { ErrorAlert } from '@/components/ui/error-alert';
import { JsonBlock } from '@/components/ui/json-block';
import { KeyValueGrid } from '@/components/ui/key-value-grid';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { PageHeader } from '@/components/ui/page-header';

export default function AdminUserDetailPage() {
  const params = useParams();
  const id = String(params.id ?? '');

  const [user, setUser] = useState<unknown>(null);
  const [products, setProducts] = useState<unknown>(null);
  const [reviews, setReviews] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setErrorText('');

        const [userRes, productsRes, reviewsRes] = await Promise.all([
          apiFetch(`/admin/users/${id}`, { method: 'GET', auth: true }),
          apiFetch(`/admin/users/${id}/products`, { method: 'GET', auth: true }),
          apiFetch(`/admin/users/${id}/reviews`, { method: 'GET', auth: true }),
        ]);

        if (!cancelled) {
          setUser(userRes);
          setProducts(productsRes);
          setReviews(reviewsRes);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorText(error instanceof Error ? error.message : 'Не удалось загрузить пользователя');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <LoadingScreen title="Загружаем пользователя..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Карточка пользователя"
        description="Детали пользователя плюс связанные товары и генерации."
      />

      {errorText ? <ErrorAlert text={errorText} /> : null}

      {user ? (
        <Card>
          <KeyValueGrid
            data={user}
            preferredKeys={['id', 'email', 'name', 'role', 'isActive', 'lastLoginAt', 'defaultTone', 'toneNotes']}
          />
        </Card>
      ) : null}

      <Card>
        <div className="mb-4 text-lg font-semibold text-white">Товары пользователя</div>
        <DataTable rows={toArray(products)} preferredColumns={['id', 'article', 'name', 'brand', 'model', 'updatedAt']} />
      </Card>

      <Card>
        <div className="mb-4 text-lg font-semibold text-white">Генерации пользователя</div>
        <DataTable rows={toArray(reviews)} preferredColumns={['id', 'status', 'productName', 'rating', 'createdAt']} />
      </Card>

      <Card>
        <JsonBlock title="Raw user response" data={user} />
      </Card>
    </div>
  );
}
