'use client';

import { useTranslation } from '@hatohui/i18n';
import { useAssets } from '@hatohui/models';
import { COMMISSION_GALLERY_PAGE_SIZE } from '@/constants/commission';
import type { useCommissionPricingEstimate } from './useCommissionPricingEstimate';
import { useImageViewer } from './useImageViewer';

type Pricing = ReturnType<typeof useCommissionPricingEstimate>;

export function useCommissionExampleGallery(
  artistId: string,
  pricing: Pricing,
  commissionTypeId: string,
) {
  const { t } = useTranslation('art');
  const viewer = useImageViewer();
  const selectedType = pricing.types.find(
    (type) => type.id === commissionTypeId,
  );
  const tag = selectedType?.tagName ?? undefined;
  const query = useAssets({
    tag,
    uploadedById: artistId,
    sort: 'newest',
    page: 1,
    pageSize: COMMISSION_GALLERY_PAGE_SIZE,
  });
  const items = query.data?.data.items ?? [];

  return {
    title: selectedType
      ? t('commission.gallery.typeTitle', {
          type: t(`commission.type.${selectedType.key}.label`, {
            defaultValue: selectedType.label,
          }),
        })
      : t('commission.gallery.recentTitle'),
    items,
    isEmpty: !query.isPending && items.length === 0,
    viewer,
  };
}
