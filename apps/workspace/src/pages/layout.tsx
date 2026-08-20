import type { ReactNode } from 'react';
import AdminKeyProvider from '../components/auth/AdminKeyProvider';
import AdminGate from '../components/auth/AdminGate';
import Sidebar from '../components/nav/Sidebar';

function RootLayout({ children }: { children: ReactNode }) {
  return (
    <AdminKeyProvider>
      <AdminGate>
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">{children}</main>
        </div>
      </AdminGate>
    </AdminKeyProvider>
  );
}

export default RootLayout;
