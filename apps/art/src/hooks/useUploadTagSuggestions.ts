'use client';

import { useMemo } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { useAssetTagSuggestions } from '@hatohui/models';
import type { TagSuggestion } from '@hatohui/ui';

export function useUploadTagSuggestions(enabled: boolean) {
  const { t } = useTranslation('art');
  const query = useAssetTagSuggestions({ query: { enabled } });

  return useMemo<TagSuggestion[]>(
    () =>
      (query.data?.data ?? []).map((tag) => ({
        value: tag.name,
        hint: tag.commissionTypeLabel
          ? t('gallery.upload.tagHintType', { label: tag.commissionTypeLabel })
          : t('gallery.upload.tagHintUsed', { count: tag.usageCount }),
      })),
    [query.data, t],
  );
}
