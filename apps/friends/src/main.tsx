import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import { setApiBaseUrl } from '@hatohui/models';
import { AuthProvider } from '@hatohui/libs';
import { OnboardingModalProvider } from './components/onboarding/OnboardingModalContext';
import OnboardingModal from './components/onboarding/OnboardingModal';
import { SettingsModalProvider } from './components/settings/SettingsModalContext';
import GlobalSettingsDialog from './components/settings/GlobalSettingsDialog';
import './index.css';
import './config/i18n';
import router from './config/router';

setApiBaseUrl(import.meta.env.VITE_API_URL);

const queryClient = new QueryClient();

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- eslint's projectService disagrees with `tsc -b` here; the build requires this assertion.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider
        googleClientId={import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID}
      >
        <OnboardingModalProvider>
          <SettingsModalProvider>
            <RouterProvider router={router} />
            <OnboardingModal />
            <GlobalSettingsDialog />
          </SettingsModalProvider>
        </OnboardingModalProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
