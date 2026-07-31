import { createContext, useContext } from 'react';

export interface SettingsModalContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const SettingsModalContext = createContext<
  SettingsModalContextValue | undefined
>(undefined);

export function useSettingsModal(): SettingsModalContextValue {
  const context = useContext(SettingsModalContext);
  if (!context) {
    throw new Error(
      'useSettingsModal must be used within a SettingsModalProvider',
    );
  }
  return context;
}
