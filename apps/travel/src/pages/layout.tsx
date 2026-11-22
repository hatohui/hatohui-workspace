import type { ReactNode } from 'react';
import { useLocation } from 'react-router';
import { cn } from '@hatohui/ui';
import TravelLocationProvider from '../components/location/TravelLocationProvider';
import MobileBottomNav from '../components/layout/MobileBottomNav';
import NavigationProgress from '../components/layout/NavigationProgress';
import TravelHeader from '../components/layout/TravelHeader';
import routes from '../constants/routes';

function RootLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const section = pathname.split('/')[1] ?? '';
  const isWide =
    pathname === routes.catalog || pathname.startsWith(routes.admin);

  return (
    <TravelLocationProvider>
      <div className="min-h-dvh bg-background">
        <NavigationProgress />
        <TravelHeader />
        <main
          className={cn(
            isWide
              ? 'w-full px-4 pt-5 pb-24 sm:px-6 sm:pt-6 md:pb-16'
              : 'mx-auto max-w-6xl px-4 pt-5 pb-24 sm:pt-8 md:pb-16',
          )}
        >
          <div
            key={section}
            className="animate-in duration-200 ease-out fade-in-0 slide-in-from-bottom-1 motion-reduce:animate-none"
          >
            {children}
          </div>
        </main>
        <MobileBottomNav />
      </div>
    </TravelLocationProvider>
  );
}

export default RootLayout;
