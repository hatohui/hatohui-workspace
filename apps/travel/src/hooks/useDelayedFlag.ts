import { useEffect, useState } from 'react';

export function useDelayedFlag(active: boolean, delayMs: number) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!active) {
      setShown(false);
      return;
    }
    const timer = window.setTimeout(() => setShown(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [active, delayMs]);

  return active && shown;
}
