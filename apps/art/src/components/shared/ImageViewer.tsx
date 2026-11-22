'use client';

import Link from 'next/link';
import { useTranslation } from '@hatohui/i18n';
import {
  ImageViewer as SharedImageViewer,
  type ImageViewerCaption,
} from '@hatohui/ui';

export function ImageViewer({
  src,
  alt,
  caption = {},
  originalUrl = null,
  detailsUrl = null,
  onPrevious,
  onNext,
  onClose,
}: {
  src: string | null;
  alt: string;
  caption?: ImageViewerCaption;
  originalUrl?: string | null;
  detailsUrl?: string | null;
  onPrevious?: () => void;
  onNext?: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation('art');

  return (
    <SharedImageViewer
      src={src}
      alt={alt}
      caption={caption}
      originalUrl={originalUrl}
      detailsUrl={detailsUrl}
      onPrevious={onPrevious}
      onNext={onNext}
      onClose={onClose}
      LinkComponent={Link}
      labels={{
        zoomIn: t('imageViewer.zoomIn'),
        zoomOut: t('imageViewer.zoomOut'),
        reset: t('imageViewer.reset'),
        close: t('imageViewer.close'),
        download: t('imageViewer.download'),
        toggleCaption: t('imageViewer.toggleCaption'),
        openDetails: t('imageViewer.openDetails'),
        previous: t('imageViewer.previous'),
        next: t('imageViewer.next'),
      }}
    />
  );
}
