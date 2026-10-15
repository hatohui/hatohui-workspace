import { useCallback, useEffect, useRef, useState } from 'react';
import { COPIED_RESET_MS } from './socialLinkData';

export function useCopyHandle(handle: string) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(() => {
    void navigator.clipboard.writeText(handle);
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
  }, [handle]);

  return { copied, copy };
}
