import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from './AuthContext';

export function useGoogleAuth() {
  const { loginWithGoogle } = useAuth();

  return useGoogleLogin({
    flow: 'auth-code',
    onSuccess: (codeResponse) => {
      void loginWithGoogle(codeResponse.code);
    },
  });
}
