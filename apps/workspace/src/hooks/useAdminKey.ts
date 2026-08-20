import { createContext, useContext, useEffect, useState } from 'react';
import { setAdminKey } from '@hatohui/models';

const STORAGE_KEY = 'workspace:admin-key';

export interface AdminKeyValue {
  key: string | null;
  save: (value: string) => void;
  clear: () => void;
}

export const AdminKeyContext = createContext<AdminKeyValue | undefined>(
  undefined,
);

export function useProvideAdminKey(): AdminKeyValue {
  const [key, setKey] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEY),
  );

  useEffect(() => {
    setAdminKey(key ?? undefined);
  }, [key]);

  return {
    key,
    save: (value: string) => {
      localStorage.setItem(STORAGE_KEY, value);
      setKey(value);
    },
    clear: () => {
      localStorage.removeItem(STORAGE_KEY);
      setKey(null);
    },
  };
}

export function useAdminKey(): AdminKeyValue {
  const context = useContext(AdminKeyContext);
  if (!context) {
    throw new Error('useAdminKey must be used within an AdminKeyContext');
  }
  return context;
}
