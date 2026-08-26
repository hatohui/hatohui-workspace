import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getSessionUser } from '@/lib/session';
import { AppSidebar } from '@/components/layout/AppSidebar';

export default async function AppShellLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect('/');
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
