import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setApiBaseUrl } from '@hatohui/models';
import { AuthProvider } from '@hatohui/libs';
import './index.css';
import App from './App.tsx';

setApiBaseUrl(import.meta.env.VITE_API_URL);

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider
        googleClientId={import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID}
      >
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
