'use client';

import { useTranslation } from '@hatohui/i18n';
import type { useGalleryAssets } from '@/hooks/useGalleryAssets';
import { GallerySearch } from './GallerySearch';
import { GalleryHidePrivateToggle } from './GalleryHidePrivateToggle';

export function GalleryFilters({
  gallery,
  canHidePrivate,
}: {
  gallery: ReturnType<typeof useGalleryAssets>;
  canHidePrivate: boolean;
}) {
  const { t } = useTranslation('art');

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <GallerySearch gallery={gallery} />
      {!gallery.isLoading && gallery.total > 0 && (
        <p className="text-sm text-muted-foreground tabular-nums">
          {t('gallery.count', { count: gallery.total })}
        </p>
      )}
      {canHidePrivate && (
        <GalleryHidePrivateToggle
          hidePrivate={gallery.hidePrivate}
          onChange={gallery.setHidePrivate}
        />
      )}
    </div>
  );
}
