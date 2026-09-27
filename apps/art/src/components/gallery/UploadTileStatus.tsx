'use client';

import { AlertCircle, Check } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import type { UploadItem } from '@/hooks/useUploadQueue';

export function UploadTileStatus({ item }: { item: UploadItem }) {
  const { t } = useTranslation('art');

  if (item.status === 'pending') return null;

  return (
    <div
      role="status"
      aria-label={t(`gallery.upload.status.${item.status}`)}
      className="absolute inset-0 flex items-center justify-center bg-background/60"
    >
      {item.status === 'uploading' && (
        <div className="h-1.5 w-3/4 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${Math.round(item.progress * 100)}%` }}
          />
        </div>
      )}
      {item.status === 'done' && (
        <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-4" aria-hidden />
        </span>
      )}
      {item.status === 'failed' && (
        <span className="flex size-8 items-center justify-center rounded-full bg-destructive text-white">
          <AlertCircle className="size-4" aria-hidden />
        </span>
      )}
    </div>
  );
}
