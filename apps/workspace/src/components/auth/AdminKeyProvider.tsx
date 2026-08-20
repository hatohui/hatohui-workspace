import type { ReactNode } from 'react';
import { AdminKeyContext, useProvideAdminKey } from '../../hooks/useAdminKey';

function AdminKeyProvider({ children }: { children: ReactNode }) {
  const value = useProvideAdminKey();
  return (
    <AdminKeyContext.Provider value={value}>
      {children}
    </AdminKeyContext.Provider>
  );
}

export default AdminKeyProvider;
