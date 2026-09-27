import { useMemo } from 'react';
import { useTranslation } from '@hatohui/i18n';
import type { AssetDto } from '@hatohui/models';

const BYTES_PER_KB = 1024;
const BYTES_PER_MB = BYTES_PER_KB * 1024;

function formatBytes(bytes: number): string {
  if (bytes < BYTES_PER_KB) return `${bytes} B`;
  if (bytes < BYTES_PER_MB) return `${(bytes / BYTES_PER_KB).toFixed(1)} KB`;
  return `${(bytes / BYTES_PER_MB).toFixed(1)} MB`;
}

export function useArtworkDetails(asset: AssetDto) {
  const { t, i18n } = useTranslation('art');

  return useMemo(
    () =>
      [
        asset.width && asset.height
          ? {
              label: t('gallery.detail.dimensions'),
              value: `${asset.width}×${asset.height}`,
            }
          : null,
        { label: t('gallery.detail.size'), value: formatBytes(asset.size) },
        {
          label: t('gallery.detail.uploaded'),
          value: new Date(asset.createdAt).toLocaleDateString(i18n.language),
        },
      ].filter((row) => row !== null),
    [asset, t, i18n.language],
  );
}
