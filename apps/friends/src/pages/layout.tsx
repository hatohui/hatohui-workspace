import type { ReactNode } from 'react';
import SidebarNav from '../components/nav/SidebarNav';

function RootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SidebarNav />
      <div className="pb-20 sm:pb-8 sm:pl-24">
        <div className="mx-auto max-w-2xl px-4 pt-8">
          <main>{children}</main>
        </div>
      </div>
    </>
  );
}

export default RootLayout;
