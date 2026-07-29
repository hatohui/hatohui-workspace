import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useAuth } from '@hatohui/libs';
import {
  OnboardingModalContext as Context,
  type OnboardingModalContextValue,
} from '../../hooks/useOnboardingModal';

export function OnboardingModalProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const autoOpenedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!user || user.onboardingStatus !== 'PENDING') return;
    if (autoOpenedFor.current === user.id) return;
    autoOpenedFor.current = user.id;
    setIsOpen(true);
  }, [user]);

  const value = useMemo<OnboardingModalContextValue>(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }),
    [isOpen],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}
