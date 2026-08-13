import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getSessionUser } from '@/lib/session';
import { AdminNav } from '@/components/layout/AdminNav';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getSessionUser();
  if (!user || !user.isAdmin) {
    redirect('/');
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <AdminNav />
      {children}
    </div>
  );
}
