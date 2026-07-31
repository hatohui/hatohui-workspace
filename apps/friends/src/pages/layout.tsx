import type { ReactNode } from 'react';
import SidebarNav from '../components/SidebarNav';
import { OnboardingModalProvider } from '../components/onboarding/OnboardingModalContext';
import OnboardingModal from '../components/onboarding/OnboardingModal';

function RootLayout({ children }: { children: ReactNode }) {
  return (
    <OnboardingModalProvider>
      <SidebarNav />
      <div className="mx-auto max-w-2xl px-4 pt-8 pb-20 sm:pl-24 sm:pb-8">
        <main>{children}</main>
      </div>
      <OnboardingModal />
    </OnboardingModalProvider>
  );
}

export default RootLayout;
