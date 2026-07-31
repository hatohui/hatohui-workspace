import { useMemo, useState, type ReactNode } from 'react';
import {
  SettingsModalContext as Context,
  type SettingsModalContextValue,
} from '../../hooks/useSettingsModal';

export function SettingsModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo<SettingsModalContextValue>(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }),
    [isOpen],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}
