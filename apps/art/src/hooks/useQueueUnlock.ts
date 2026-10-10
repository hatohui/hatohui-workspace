'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@hatohui/i18n';
import {
  useUnlockQueuedCommission,
  type CommissionAccessMatchDto,
  type CommissionQueueItemDto,
} from '@hatohui/models';
import { queueOrderPath } from '@/constants/queue';
import { useCommissionFormatters } from './useCommissionFormatters';
import { usePasscodeError } from './usePasscodeError';

interface UnlockTarget {
  id: string;
  title: string;
}

type TypeFields = Pick<
  CommissionQueueItemDto,
  'commissionTypeKey' | 'commissionTypeLabel'
>;

export function useQueueUnlock() {
  const { t } = useTranslation('art');
  const format = useCommissionFormatters();
  const router = useRouter();
  const [target, setTarget] = useState<UnlockTarget | null>(null);
  const [passcode, setPasscode] = useState('');
  const unlock = useUnlockQueuedCommission();
  const errorMessage = usePasscodeError();

  const typeOf = (item: TypeFields) =>
    item.commissionTypeKey || item.commissionTypeLabel
      ? format.type(item.commissionTypeKey, item.commissionTypeLabel)
      : null;

  const open = (next: UnlockTarget) => {
    unlock.reset();
    setPasscode('');
    setTarget(next);
  };

  const submit = async () => {
    if (!target || !passcode.trim()) return;
    const result = await unlock
      .mutateAsync({ data: { commissionId: target.id, passcode } })
      .catch(() => null);
    if (result) router.push(queueOrderPath(result.data.accessCode));
  };

  const openQueueItem = (item: CommissionQueueItemDto) => {
    if (item.accessCode) {
      router.push(queueOrderPath(item.accessCode));
      return;
    }
    const type = typeOf(item);
    open({
      id: item.id,
      title: type
        ? t('queue.unlock.title', { position: item.position, type })
        : t('queue.unlock.titlePosition', { position: item.position }),
    });
  };

  return {
    target,
    openQueueItem,
    openMatch: (match: CommissionAccessMatchDto) =>
      open({ id: match.id, title: typeOf(match) ?? t('queue.unlock.order') }),
    close: () => setTarget(null),
    passcode,
    setPasscode,
    submit,
    isSubmitting: unlock.isPending || unlock.isSuccess,
    error: errorMessage(unlock.error),
  };
}
