import { useState } from 'react';
import { useAuth } from './AuthContext';

export function useConfirmLogout() {
  const { logout } = useAuth();
  const [confirming, setConfirming] = useState(false);

  return {
    confirming,
    requestLogout: () => setConfirming(true),
    cancelLogout: () => setConfirming(false),
    confirmLogout: async () => {
      setConfirming(false);
      await logout();
    },
  };
}
