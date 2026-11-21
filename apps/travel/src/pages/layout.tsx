import type { ReactNode } from 'react';
import TravelHeader from '../components/layout/TravelHeader';

function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <TravelHeader />
      <main className="mx-auto max-w-6xl px-4 pt-8 pb-16">{children}</main>
    </div>
  );
}

export default RootLayout;
