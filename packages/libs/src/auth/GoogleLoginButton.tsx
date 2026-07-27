import { useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { loadGoogleIdentityScript } from './google-identity';

export function GoogleLoginButton() {
  const { googleClientId, loginWithGoogle } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    void loadGoogleIdentityScript().then(() => {
      if (cancelled || !buttonRef.current || !window.google) {
        return;
      }
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response) => {
          void loginWithGoogle(response.credential);
        },
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
      });
    });

    return () => {
      cancelled = true;
    };
  }, [googleClientId, loginWithGoogle]);

  return <div ref={buttonRef} />;
}
