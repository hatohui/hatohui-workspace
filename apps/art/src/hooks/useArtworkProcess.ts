'use client';

import { useTranslation } from '@hatohui/i18n';
import { useAssetProcess, type AssetDto } from '@hatohui/models';
import { useImageViewer } from './useImageViewer';

export function useArtworkProcess(asset: AssetDto) {
  const { t } = useTranslation('art');
  const viewer = useImageViewer();
  const query = useAssetProcess(asset.id);
  const steps = query.data?.data ?? [];

  const frames = [
    ...steps.map((step, index) => ({
      key: step.id,
      src: step.imageUrl,
      label: step.label ?? String(index + 1),
      isFinal: false,
    })),
    {
      key: 'final',
      src: asset.thumbnailUrl ?? asset.previewUrl ?? asset.publicUrl,
      label: t('gallery.process.final'),
      isFinal: true,
    },
  ];

  const open = (index: number) =>
    viewer.openImages(
      frames.map((frame) => ({
        src: frame.isFinal ? (asset.previewUrl ?? asset.publicUrl) : frame.src,
        caption: { title: frame.label },
      })),
      index,
    );

  return { hasProcess: steps.length > 0, frames, open, viewer };
}
