'use client';

import { useTranslation } from '@hatohui/i18n';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@hatohui/ui';
import type { useQueueUnlock } from '@/hooks/useQueueUnlock';
import { useCommissionFormatters } from '@/hooks/useCommissionFormatters';
import { QueueUnlockForm } from './QueueUnlockForm';
import { QueueNoPasscodeNotice } from './QueueNoPasscodeNotice';

export function QueueUnlockDialog({
  unlock,
}: {
  unlock: ReturnType<typeof useQueueUnlock>;
}) {
  const { t } = useTranslation('art');
  const format = useCommissionFormatters();
  const item = unlock.item;

  return (
    <Dialog
      open={item !== null}
      onOpenChange={(open) => !open && unlock.close()}
    >
      <DialogContent className="sm:max-w-md">
        {item && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">
                {t('queue.unlock.title', {
                  position: item.position,
                  type: format.type(
                    item.commissionTypeKey,
                    item.commissionTypeLabel,
                  ),
                })}
              </DialogTitle>
              <DialogDescription>
                {item.isUnlockable
                  ? t('queue.unlock.description')
                  : t('queue.unlock.noPasscode')}
              </DialogDescription>
            </DialogHeader>
            {item.isUnlockable ? (
              <QueueUnlockForm unlock={unlock} />
            ) : (
              <QueueNoPasscodeNotice onClose={unlock.close} />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
