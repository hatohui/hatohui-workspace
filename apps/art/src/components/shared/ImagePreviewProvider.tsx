'use client';

import type { ReactNode } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { useImageViewer } from '@/hooks/useImageViewer';
import { ImagePreviewContext } from '@/hooks/useImagePreview';
import { ImageViewer } from './ImageViewer';

export function ImagePreviewProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation('art');
  const viewer = useImageViewer();

  return (
    <ImagePreviewContext.Provider value={viewer.open}>
      {children}
      <ImageViewer
        src={viewer.src}
        alt={t('imageViewer.image')}
        caption={viewer.caption}
        onClose={viewer.close}
      />
    </ImagePreviewContext.Provider>
  );
}
