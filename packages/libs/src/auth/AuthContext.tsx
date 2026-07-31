import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useLoginWithGoogle, useLogout, useMe } from '@hatohui/models';
import type { UserDto } from '@hatohui/models';

interface AuthContextValue {
  user: UserDto | null;
  isLoading: boolean;
  isLoggingIn: boolean;
  loginWithGoogle: (code: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({
  googleClientId,
  children,
}: {
  googleClientId: string;
  children: ReactNode;
}) {
  const meQuery = useMe({ query: { retry: false } });
  const loginMutation = useLoginWithGoogle();
  const logoutMutation = useLogout();

  const value = useMemo<AuthContextValue>(
    () => ({
      user: meQuery.data?.data ?? null,
      isLoading: meQuery.isPending,
      isLoggingIn: loginMutation.isPending,
      loginWithGoogle: async (code: string) => {
        await loginMutation.mutateAsync({ data: { code } });
        await meQuery.refetch();
      },
      logout: async () => {
        await logoutMutation.mutateAsync();
        await meQuery.refetch();
      },
    }),
    [
      meQuery.data,
      meQuery.isPending,
      meQuery.refetch,
      loginMutation,
      logoutMutation,
    ],
  );

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </GoogleOAuthProvider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
