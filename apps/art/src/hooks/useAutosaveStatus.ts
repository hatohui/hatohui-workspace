'use client';

import { useEffect, useRef, useState } from 'react';
import { useIsMutating } from '@tanstack/react-query';
import { AUTOSAVE_SAVED_FLASH_MS } from '@/constants/commission';

export type AutosaveStatus = 'idle' | 'saving' | 'saved';

export function useAutosaveStatus(): AutosaveStatus {
  const pending = useIsMutating();
  const wasSaving = useRef(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (pending > 0) {
      wasSaving.current = true;
      return;
    }
    if (!wasSaving.current) return;
    wasSaving.current = false;
    setJustSaved(true);
    const timer = window.setTimeout(
      () => setJustSaved(false),
      AUTOSAVE_SAVED_FLASH_MS,
    );
    return () => window.clearTimeout(timer);
  }, [pending]);

  if (pending > 0) return 'saving';
  return justSaved ? 'saved' : 'idle';
}
