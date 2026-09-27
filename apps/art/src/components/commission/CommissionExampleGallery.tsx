'use client';

import { useTranslation } from '@hatohui/i18n';
import type { useCommissionForm } from '@/hooks/useCommissionForm';
import { useCommissionExampleGallery } from '@/hooks/useCommissionExampleGallery';
import { COMMISSION_GALLERY_ROW_HEIGHT_CLASS } from '@/constants/commission';
import { ImageViewer } from '@/components/shared/ImageViewer';
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
    <aside className="hidden lg:sticky lg:top-8 lg:block lg:max-h-[calc(100vh-4rem)] lg:self-start lg:overflow-y-auto">
      <h2 className="mb-4 font-serif text-2xl">{gallery.title}</h2>
      {gallery.isEmpty ? (
        <p className="text-sm text-muted-foreground">
          {t('commission.gallery.empty')}
        </p>
      ) : (
        <div
          className={`flex flex-wrap gap-2 after:grow-[999999] after:content-[''] ${COMMISSION_GALLERY_ROW_HEIGHT_CLASS}`}
        >
          {gallery.items.map((asset) => (
            <CommissionExampleTile
              key={asset.id}
              asset={asset}
              onView={gallery.viewer.open}
            />
          ))}
        </div>
      )}
      <ImageViewer
        src={gallery.viewer.src}
        alt={gallery.title}
        onClose={gallery.viewer.close}
      />
    </aside>
  );
}
