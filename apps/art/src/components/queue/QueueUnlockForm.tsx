'use client';

import { useTranslation } from '@hatohui/i18n';
import { Button, Input, Label } from '@hatohui/ui';
import type { useQueueUnlock } from '@/hooks/useQueueUnlock';
import {
  PASSCODE_MAX_LENGTH,
  QUEUE_PASSCODE_INPUT_ID,
} from '@/constants/queue';

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
        <Label htmlFor={QUEUE_PASSCODE_INPUT_ID}>
          {t('queue.passcode.label')}
        </Label>
        <Input
          id={QUEUE_PASSCODE_INPUT_ID}
          type="password"
          autoComplete="off"
          enterKeyHint="go"
          maxLength={PASSCODE_MAX_LENGTH}
          className="max-sm:h-11"
          value={unlock.passcode}
          aria-invalid={unlock.error ? true : undefined}
          aria-describedby="queue-passcode-error"
          onChange={(event) => unlock.setPasscode(event.target.value)}
        />
        <p
          id="queue-passcode-error"
          role="alert"
          className="text-sm text-destructive empty:hidden"
        >
          {unlock.error}
        </p>
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="max-sm:h-11"
          onClick={unlock.close}
        >
          {t('gallery.upload.cancel')}
        </Button>
        <Button
          type="submit"
          className="max-sm:h-11"
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
