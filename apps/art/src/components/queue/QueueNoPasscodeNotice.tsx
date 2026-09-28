'use client';

import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';

export function QueueNoPasscodeNotice({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation('art');

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {t('queue.unlock.noPasscodeHelp')}
      </p>
      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          {t('queue.unlock.gotIt')}
        </Button>
      </div>
    </div>
  );
}
