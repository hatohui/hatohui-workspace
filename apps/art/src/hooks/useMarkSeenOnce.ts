'use client';

import { useEffect, useRef } from 'react';

export function useMarkSeenOnce(isReady: boolean, markSeen: () => unknown) {
  const hasMarked = useRef(false);

  useEffect(() => {
    if (!isReady || hasMarked.current) return;
    hasMarked.current = true;
    markSeen();
  }, [isReady, markSeen]);
}
