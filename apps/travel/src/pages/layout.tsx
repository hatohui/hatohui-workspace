import type { ReactNode } from 'react';
import { useLocation } from 'react-router';
import { cn } from '@hatohui/ui';
import MobileBottomNav from '../components/layout/MobileBottomNav';
import TravelHeader from '../components/layout/TravelHeader';
import routes from '../constants/routes';

function RootLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const isWide =
    pathname === routes.catalog || pathname.startsWith(routes.admin);

  return (
    <div className="min-h-dvh bg-background">
      <TravelHeader />
      <main
        className={cn(
          isWide
            ? 'w-full px-4 pt-5 pb-24 sm:px-6 sm:pt-6 md:pb-16'
            : 'mx-auto max-w-6xl px-4 pt-5 pb-24 sm:pt-8 md:pb-16',
        )}
      >
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}

export default RootLayout;
