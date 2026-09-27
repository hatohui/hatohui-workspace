'use client';

import { useTranslation } from '@hatohui/i18n';
import type { AssetDto } from '@hatohui/models';
import { ASSET_SUMMARY_TAG_LIMIT } from '@/constants/gallery';

export function useAssetSummary(asset: AssetDto) {
  const { i18n } = useTranslation('art');

  return {
    tags: asset.tags.slice(0, ASSET_SUMMARY_TAG_LIMIT),
    date: new Date(asset.createdAt).toLocaleDateString(i18n.language, {
      month: 'short',
      year: 'numeric',
    }),
  };
}
