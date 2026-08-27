'use client';

import { useEffect, useState } from 'react';

const STORAGE_PREFIX = 'hatohui:art:group-member-code:';

/** Remembers which of the visitor's own commission access codes proves
 * their membership in this group — a browser-local convenience, not the
 * credential itself (the PRD: "what the browser remembers is the
 * convenience... keyed per access code"). Read after mount only, since
 * localStorage doesn't exist during SSR. */
export function useGroupMemberCode(groupCode: string) {
  const [memberCode, setMemberCodeState] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(
        `${STORAGE_PREFIX}${groupCode}`,
      );
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage, unavailable at render/SSR time
      setMemberCodeState(stored);
    } catch {
      // localStorage unavailable — the visitor just re-enters their code.
    }
  }, [groupCode]);

  const setMemberCode = (code: string) => {
    setMemberCodeState(code);
    try {
      window.localStorage.setItem(`${STORAGE_PREFIX}${groupCode}`, code);
    } catch {
      // Best-effort only.
    }
  };

  return { memberCode, setMemberCode };
}
