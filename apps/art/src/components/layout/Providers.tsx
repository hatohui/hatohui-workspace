'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  AuthProvider,
  OnboardingModalProvider,
  OnboardingModal,
} from '@hatohui/libs';
import { TooltipProvider } from '@hatohui/ui';
import { useTranslation, detectLocale } from '@hatohui/i18n';
import '@/lib/api';
import '@/config/i18n';
import { SUPPORTED_LOCALES } from '@/config/i18n';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const { i18n } = useTranslation();

  useEffect(() => {
    const locale = detectLocale(SUPPORTED_LOCALES, 'en');
    if (locale !== i18n.language) {
      void i18n.changeLanguage(locale);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once, post-hydration only
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider
        googleClientId={
          process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID as string
        }
      >
        <OnboardingModalProvider>
          <TooltipProvider>{children}</TooltipProvider>
          <OnboardingModal mode="identity" />
        </OnboardingModalProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
