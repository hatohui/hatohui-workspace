'use client';

import { useTranslation } from '@hatohui/i18n';
import type { ImageUploadLimitsDto } from '@hatohui/models';
import { BYTES_PER_MEGABYTE } from '@/constants/gallery';
import type { SkippedFile, UploadItem } from './useUploadQueue';

const megabytes = (bytes: number) => Math.ceil(bytes / BYTES_PER_MEGABYTE);

export function useUploadFileMessages(
  items: UploadItem[],
  skipped: SkippedFile[],
  limits: ImageUploadLimitsDto | undefined,
) {
  const { t } = useTranslation('art');
  const maxMegabytes = limits ? megabytes(limits.maxBytes) : undefined;
  const isUploading = items.some((item) => item.status === 'uploading');

  return {
    capacity: limits
      ? t('gallery.upload.capacity', {
          count: items.length,
          max: limits.maxFiles,
          size: maxMegabytes,
        })
      : null,
    progress: isUploading
      ? t('gallery.upload.progress', {
          done: items.filter((item) => item.status === 'done').length,
          total: items.length,
        })
      : null,
    skipped: skipped.map((file) =>
      t(`gallery.upload.skipped.${file.reason}`, {
        name: file.name,
        size: megabytes(file.size),
        max: file.reason === 'overLimit' ? limits?.maxFiles : maxMegabytes,
      }),
    ),
  };
}
