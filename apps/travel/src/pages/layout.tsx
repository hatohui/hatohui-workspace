import type { ReactNode } from 'react';
import MobileBottomNav from '../components/layout/MobileBottomNav';
import TravelHeader from '../components/layout/TravelHeader';

function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <TravelHeader />
      <main className="mx-auto max-w-6xl px-4 pt-5 pb-24 sm:pt-8 md:pb-16">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}

export default RootLayout;
