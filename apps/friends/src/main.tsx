import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import { setApiBaseUrl } from '@hatohui/models';
import './index.css';
import './config/i18n';
import router from './config/router';

setApiBaseUrl(import.meta.env.VITE_API_URL);

const queryClient = new QueryClient();

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- eslint's projectService disagrees with `tsc -b` here; the build requires this assertion.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
