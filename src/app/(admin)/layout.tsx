import { AdminGuard } from '@/components/auth/admin-guard';
import { AppShell } from '@/components/layout/app-shell';
import { adminNav } from '@/lib/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <AppShell title="Admin зона" navItems={adminNav}>
        {children}
      </AppShell>
    </AdminGuard>
  );
}
