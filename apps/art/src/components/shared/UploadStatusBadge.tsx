'use client';

import { AlertCircle, Check } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Spinner } from '@hatohui/ui';
import type { UploadStatus } from '@/hooks/useBulkAssetUpload';

export function UploadStatusBadge({ status }: { status: UploadStatus }) {
  const { t } = useTranslation('art');

  return (
    <div
      role="status"
      aria-label={t(`gallery.upload.status.${status}`)}
      className="absolute inset-0 flex items-center justify-center bg-background/60"
    >
      {status === 'uploading' && (
        <Spinner label={t('gallery.upload.status.uploading')} />
      )}
      {status === 'done' && (
        <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-4" aria-hidden />
        </span>
      )}
      {status === 'failed' && (
        <span className="flex size-8 items-center justify-center rounded-full bg-destructive text-white">
          <AlertCircle className="size-4" aria-hidden />
        </span>
      )}
    </div>
  );
}
