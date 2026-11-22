import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { RouterProvider } from 'react-router';
import { setApiBaseUrl } from '@hatohui/models';
import { AuthProvider } from '@hatohui/libs';
import { ToastProvider, TooltipProvider } from '@hatohui/ui';
import './index.css';
import './config/i18n';
import { persistOptions, queryClient } from './config/queryClient';
import router from './config/router';

setApiBaseUrl(import.meta.env.VITE_API_URL);

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- eslint's projectService disagrees with `tsc -b` here; the build requires this assertion.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={persistOptions}
    >
      <AuthProvider
        googleClientId={import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID}
      >
        <TooltipProvider>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </TooltipProvider>
      </AuthProvider>
    </PersistQueryClientProvider>
  </StrictMode>,
);
