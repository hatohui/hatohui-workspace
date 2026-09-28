'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  useUnlockQueuedCommission,
  type CommissionQueueItemDto,
} from '@hatohui/models';
import { queueOrderPath } from '@/constants/queue';
import { usePasscodeError } from './usePasscodeError';

export function useQueueUnlock() {
  const router = useRouter();
  const { artist } = useParams<{ artist: string }>();
  const [item, setItem] = useState<CommissionQueueItemDto | null>(null);
  const [passcode, setPasscode] = useState('');
  const unlock = useUnlockQueuedCommission();
  const errorMessage = usePasscodeError();

  const open = (next: CommissionQueueItemDto) => {
    unlock.reset();
    setPasscode('');
    setItem(next);
  };

  const submit = async () => {
    if (!item || !passcode.trim()) return;
    const result = await unlock
      .mutateAsync({ data: { commissionId: item.id, passcode } })
      .catch(() => null);
    if (result) router.push(queueOrderPath(artist, result.data.accessCode));
  };

  return {
    item,
    open,
    close: () => setItem(null),
    passcode,
    setPasscode,
    submit,
    isSubmitting: unlock.isPending || unlock.isSuccess,
    error: errorMessage(unlock.error),
  };
}
