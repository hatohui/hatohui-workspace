import type { ReactNode } from 'react';
import NavBar from '../components/NavBar';

function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <NavBar />
      <main>{children}</main>
    </div>
  );
}

export default RootLayout;
