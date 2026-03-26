import { PublicOnlyGuard } from '@/components/auth/public-only-guard';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicOnlyGuard>{children}</PublicOnlyGuard>;
}
