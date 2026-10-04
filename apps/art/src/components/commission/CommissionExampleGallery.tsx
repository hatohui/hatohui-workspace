'use client';

import { useTranslation } from '@hatohui/i18n';
import type { useCommissionForm } from '@/hooks/useCommissionForm';
import { useCommissionExampleGallery } from '@/hooks/useCommissionExampleGallery';
import { COMMISSION_GALLERY_ROW_HEIGHT_CLASS } from '@/constants/commission';
import { ImageViewer } from '@/components/shared/ImageViewer';
import { JustifiedRows } from '@/components/shared/JustifiedRows';
import { GalleryLoadMore } from '@/components/gallery/GalleryLoadMore';
import { CommissionExampleTile } from './CommissionExampleTile';

export function CommissionExampleGallery({
  form,
  artistId,
}: {
  form: ReturnType<typeof useCommissionForm>;
  artistId: string;
}) {
  const { t } = useTranslation('art');
  const gallery = useCommissionExampleGallery(
    artistId,
    form.pricing,
    form.state.commissionTypeId,
  );

  return (
    <div className="flex h-96 flex-col gap-1.5 md:h-auto md:min-h-64">
      <p className="text-sm font-medium">{gallery.title}</p>
      <div className="relative flex-1">
        <div className="absolute inset-0 overflow-y-auto rounded-md">
          {gallery.isEmpty ? (
            <p className="flex h-full items-center justify-center rounded-md bg-secondary text-sm text-muted-foreground">
              {t('commission.gallery.empty')}
            </p>
          ) : (
            <>
              <JustifiedRows
                items={gallery.items}
                getKey={(asset) => asset.id}
                stretchLastRow
                className={`gap-2 ${COMMISSION_GALLERY_ROW_HEIGHT_CLASS}`}
                renderItem={(asset) => (
                  <CommissionExampleTile
                    key={asset.id}
                    asset={asset}
                    onView={gallery.viewer.open}
                  />
                )}
              />
              <GalleryLoadMore
                hasMore={gallery.hasMore}
                isFetchingMore={gallery.isFetchingMore}
                onLoadMore={gallery.loadMore}
              />
            </>
          )}
        </div>
      </div>
      <ImageViewer
        src={gallery.viewer.src}
        alt={gallery.title}
        caption={gallery.viewer.caption}
        originalUrl={gallery.viewer.originalUrl}
        onClose={gallery.viewer.close}
      />
    </div>
  );
}
