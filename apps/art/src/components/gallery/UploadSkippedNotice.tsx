'use client';

import { Minimize2 } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Button, Spinner } from '@hatohui/ui';

export function UploadSkippedNotice({
  messages,
  canCompress,
  isCompressing,
  disabled,
  onCompress,
}: {
  messages: string[];
  canCompress: boolean;
  isCompressing: boolean;
  disabled: boolean;
  onCompress: () => void;
}) {
  const { t } = useTranslation('art');

  if (messages.length === 0) return null;

  return (
    <div
      role="alert"
      className="rounded-md bg-secondary px-3 py-2 text-sm text-muted-foreground"
    >
      <p className="font-medium text-foreground">
        {t('gallery.upload.skipped.title', { count: messages.length })}
      </p>
      <ul className="mt-1 list-disc space-y-0.5 pl-5">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
      {canCompress && (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled}
            onClick={onCompress}
          >
            {isCompressing ? <Spinner /> : <Minimize2 />}
            {isCompressing
              ? t('gallery.upload.compressing')
              : t('gallery.upload.compressAndUpload')}
          </Button>
          <span className="text-xs">{t('gallery.upload.compressHint')}</span>
        </div>
      )}
    </div>
  );
}
