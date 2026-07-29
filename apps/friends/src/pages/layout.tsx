import type { ReactNode } from 'react';
import SidebarNav from '../components/SidebarNav';
import { OnboardingModalProvider } from '../components/onboarding/OnboardingModalContext';
import OnboardingModal from '../components/onboarding/OnboardingModal';

function RootLayout({ children }: { children: ReactNode }) {
  return (
    <OnboardingModalProvider>
      <SidebarNav />
      <div className="mx-auto max-w-2xl px-4 py-8 sm:pl-24">
        <main>{children}</main>
      </div>
      <OnboardingModal />
    </OnboardingModalProvider>
  );
}

export default RootLayout;
