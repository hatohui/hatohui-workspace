import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getSessionUser } from '@/lib/session';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppMobileNav } from '@/components/layout/AppMobileNav';

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
    <div className="flex min-h-[calc(100dvh-4rem)] md:h-[calc(100dvh-4rem)]">
      <AppSidebar />
      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <AppMobileNav />
          {children}
        </div>
      </main>
    </div>
  );
}
