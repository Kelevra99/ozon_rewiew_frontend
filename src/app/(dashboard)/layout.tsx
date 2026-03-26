import { AuthGuard } from '@/components/auth/auth-guard';
import { AppShell } from '@/components/layout/app-shell';
import { dashboardNav } from '@/lib/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <AppShell title="Пользовательский кабинет" navItems={dashboardNav}>
        {children}
      </AppShell>
    </AuthGuard>
  );
}
