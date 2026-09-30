'use client';

import { Paperclip } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';

export function AttachImagesButton({
  disabled,
  onPick,
}: {
  disabled: boolean;
  onPick: (files: File[]) => void;
}) {
  const { t } = useTranslation('art');

  return (
    <Button
      asChild
      size="icon"
      variant="ghost"
      className="shrink-0 cursor-pointer text-muted-foreground has-[:disabled]:pointer-events-none has-[:disabled]:opacity-50"
    >
      <label aria-label={t('comments.attach')}>
        <Paperclip aria-hidden />
        <input
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          disabled={disabled}
          onChange={(event) => {
            onPick(Array.from(event.target.files ?? []));
            event.target.value = '';
          }}
        />
      </label>
    </Button>
  );
}
