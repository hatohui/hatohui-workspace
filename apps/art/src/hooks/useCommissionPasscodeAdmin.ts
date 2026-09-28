'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getCommissionQueryKey,
  useClearCommissionPasscode,
  useSetCommissionPasscode,
} from '@hatohui/models';
import {
  PASSCODE_COPIED_FLASH_MS,
  PASSCODE_MIN_LENGTH,
} from '@/constants/queue';

export function useCommissionPasscodeAdmin(commissionId: string) {
  const queryClient = useQueryClient();
  const [revealed, setRevealed] = useState<string | null>(null);
  const [custom, setCustom] = useState('');
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: getCommissionQueryKey(commissionId),
    });

  const set = useSetCommissionPasscode({
    mutation: {
      onSuccess: (response) => {
        setRevealed(response.data.passcode);
        setIsCustomOpen(false);
        setCustom('');
        setIsCopied(false);
        return invalidate();
      },
    },
  });
  const clear = useClearCommissionPasscode({
    mutation: {
      onSuccess: () => {
        setRevealed(null);
        return invalidate();
      },
    },
  });

  return {
    revealed,
    dismissRevealed: () => setRevealed(null),
    generate: () => set.mutate({ commissionId, data: {} }),
    custom,
    setCustom,
    isCustomOpen,
    toggleCustom: () => setIsCustomOpen((open) => !open),
    canSaveCustom: custom.trim().length >= PASSCODE_MIN_LENGTH,
    saveCustom: () => set.mutate({ commissionId, data: { passcode: custom } }),
    remove: () => clear.mutate({ commissionId }),
    isBusy: set.isPending || clear.isPending,
    isCopied,
    copy: async () => {
      if (!revealed) return;
      await navigator.clipboard.writeText(revealed);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), PASSCODE_COPIED_FLASH_MS);
    },
  };
}
