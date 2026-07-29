import { useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { loadGoogleIdentityScript } from './google-identity';

export function useGoogleIdentity() {
  const { googleClientId, loginWithGoogle } = useAuth();
  const initialized = useRef(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void loadGoogleIdentityScript().then(() => {
      if (cancelled || !window.google || initialized.current) {
        return;
      }
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response) => {
          void loginWithGoogle(response.credential);
        },
      });
      initialized.current = true;
      setIsReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [googleClientId, loginWithGoogle]);

  return {
    isReady,
    promptLogin: () => window.google?.accounts.id.prompt(),
  };
}
