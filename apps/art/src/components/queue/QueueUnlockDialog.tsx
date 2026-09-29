'use client';

import { Lock } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@hatohui/ui';
import type { useQueueUnlock } from '@/hooks/useQueueUnlock';
import {
  QUEUE_PASSCODE_INPUT_ID,
  QUEUE_UNLOCK_SHEET_CLASS,
} from '@/constants/queue';
import { QueueUnlockForm } from './QueueUnlockForm';

export function QueueUnlockDialog({
  unlock,
}: {
  unlock: ReturnType<typeof useQueueUnlock>;
}) {
  const { t } = useTranslation('art');
  const target = unlock.target;

  return (
    <Dialog
      open={target !== null}
      onOpenChange={(open) => !open && unlock.close()}
    >
      <DialogContent
        className={QUEUE_UNLOCK_SHEET_CLASS}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          document.getElementById(QUEUE_PASSCODE_INPUT_ID)?.focus();
        }}
      >
        {target && (
          <>
            <DialogHeader className="items-start text-left">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Lock className="size-5" aria-hidden />
              </span>
              <DialogTitle className="font-serif text-xl">
                {target.title}
              </DialogTitle>
              <DialogDescription>
                {t('queue.unlock.description')}
              </DialogDescription>
            </DialogHeader>
            <QueueUnlockForm unlock={unlock} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
