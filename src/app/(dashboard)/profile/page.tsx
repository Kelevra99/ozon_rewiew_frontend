'use client';

import { useAuth } from '@/components/auth/auth-provider';
import { Card } from '@/components/ui/card';
import { JsonBlock } from '@/components/ui/json-block';
import { KeyValueGrid } from '@/components/ui/key-value-grid';
import { PageHeader } from '@/components/ui/page-header';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Профиль"
        description="Текущая пользовательская session, восстановленная через JWT и /v1/users/me."
      />

      <Card>
        <KeyValueGrid
          data={user}
          preferredKeys={[
            'id',
            'email',
            'name',
            'role',
            'isActive',
            'lastLoginAt',
            'defaultTone',
            'toneNotes',
            'brandRules',
          ]}
        />
      </Card>

      <Card>
        <JsonBlock title="Raw user session" data={user} />
      </Card>
    </div>
  );
}
