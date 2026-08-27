'use client';

import { useCallback, useRef, useState } from 'react';

export interface PendingUndo {
  message: string;
  undo: () => void;
}

/** Fire-and-forget action with a transient "Undo" affordance — matches the
 * PRD's "accept/decline take effect immediately with no confirmation
 * dialog; an undo button is the safety net." */
export function useUndoableAction(timeoutMs = 6000) {
  const [pending, setPending] = useState<PendingUndo | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const run = useCallback(
    (message: string, action: () => void, undo: () => void) => {
      action();
      setPending({ message, undo });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setPending(null), timeoutMs);
    },
    [timeoutMs],
  );

  const dismiss = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setPending(null);
  }, []);

  const confirmUndo = useCallback(() => {
    pending?.undo();
    dismiss();
  }, [pending, dismiss]);

  return { pending, run, confirmUndo, dismiss };
}
