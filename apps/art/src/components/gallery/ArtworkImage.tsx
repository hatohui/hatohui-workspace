'use client';

import Image from 'next/image';
import { Maximize2 } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import type { AssetDto } from '@hatohui/models';
import { ARTWORK_FALLBACK_DIMENSION_PX } from '@/constants/gallery';
import { useImageViewer } from '@/hooks/useImageViewer';
import { ImageViewer } from '@/components/shared/ImageViewer';

export function ArtworkImage({ asset }: { asset: AssetDto }) {
  const { t } = useTranslation('art');
  const viewer = useImageViewer();
  const alt = asset.title ?? asset.filename;
  const openViewer = () =>
    viewer.open(asset.publicUrl, {
      title: asset.title,
      description: asset.description,
    });

  return (
    <div className="relative flex justify-center rounded-lg bg-card">
      <button
        type="button"
        aria-label={t('gallery.viewLarge')}
        className="cursor-zoom-in"
        onClick={openViewer}
      >
        <Image
          src={asset.publicUrl}
          alt={alt}
          width={asset.width ?? ARTWORK_FALLBACK_DIMENSION_PX}
          height={asset.height ?? ARTWORK_FALLBACK_DIMENSION_PX}
          sizes="100vw"
          priority
          className="h-auto max-h-[calc(100vh-12rem)] w-auto max-w-full object-contain"
        />
      </button>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="absolute right-3 bottom-3 shadow-sm"
        onClick={openViewer}
      >
        <Maximize2 aria-hidden />
        {t('gallery.viewLarge')}
      </Button>
      <ImageViewer
        src={viewer.src}
        alt={alt}
        caption={viewer.caption}
        onClose={viewer.close}
      />
    </div>
  );
}
