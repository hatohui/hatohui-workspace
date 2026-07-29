import { createContext, useContext } from 'react';

export interface OnboardingModalContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const OnboardingModalContext = createContext<
  OnboardingModalContextValue | undefined
>(undefined);

export function useOnboardingModal(): OnboardingModalContextValue {
  const context = useContext(OnboardingModalContext);
  if (!context) {
    throw new Error(
      'useOnboardingModal must be used within an OnboardingModalProvider',
    );
  }
  return context;
}
