'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useTranslation } from '@hatohui/i18n';
import { assets, getAssetsQueryKey } from '@hatohui/models';
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
  const params = {
    tag: selectedType?.tagName ?? undefined,
    uploadedById: artistId,
    sort: 'newest' as const,
    pageSize: COMMISSION_GALLERY_PAGE_SIZE,
  };
  const query = useInfiniteQuery({
    queryKey: [...getAssetsQueryKey(params), 'infinite'],
    queryFn: ({ pageParam }) => assets({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.data.hasMore ? last.data.page + 1 : undefined,
  });
  const items = query.data?.pages.flatMap((page) => page.data.items) ?? [];

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
    hasMore: query.hasNextPage,
    isFetchingMore: query.isFetchingNextPage,
    loadMore: () => void query.fetchNextPage(),
    viewer,
  };
}
