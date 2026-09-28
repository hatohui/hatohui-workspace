'use client';

import { useTranslation } from '@hatohui/i18n';
import { Button, Input, Label } from '@hatohui/ui';
import type { useQueueUnlock } from '@/hooks/useQueueUnlock';
import { PASSCODE_MAX_LENGTH } from '@/constants/queue';

export function QueueUnlockForm({
  unlock,
}: {
  unlock: ReturnType<typeof useQueueUnlock>;
}) {
  const { t } = useTranslation('art');

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        void unlock.submit();
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="queue-passcode">{t('queue.passcode.label')}</Label>
        <Input
          id="queue-passcode"
          type="password"
          autoFocus
          autoComplete="off"
          maxLength={PASSCODE_MAX_LENGTH}
          value={unlock.passcode}
          aria-invalid={unlock.error ? true : undefined}
          aria-describedby="queue-passcode-error"
          onChange={(event) => unlock.setPasscode(event.target.value)}
        />
        <p
          id="queue-passcode-error"
          role="alert"
          className="min-h-5 text-sm text-destructive"
        >
          {unlock.error}
        </p>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={unlock.close}>
          {t('gallery.upload.cancel')}
        </Button>
        <Button
          type="submit"
          disabled={!unlock.passcode.trim() || unlock.isSubmitting}
        >
          {unlock.isSubmitting
            ? t('queue.unlock.opening')
            : t('queue.unlock.open')}
        </Button>
      </div>
    </form>
  );
}
