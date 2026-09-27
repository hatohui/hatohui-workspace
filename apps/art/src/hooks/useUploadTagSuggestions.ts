'use client';

import { useMemo } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { useAssetTagSuggestions } from '@hatohui/models';
import type { TagSuggestion } from '@hatohui/ui';

export function useUploadTagSuggestions(enabled: boolean) {
  const { t } = useTranslation('art');
  const query = useAssetTagSuggestions({ query: { enabled } });

  return useMemo<TagSuggestion[]>(() => {
    const tags = query.data?.data ?? [];
    const commission = tags
      .filter((tag) => tag.commissionTypeLabel)
      .map((tag) => ({
        value: tag.name,
        hint: t('gallery.upload.tagHintType', {
          label: tag.commissionTypeLabel,
        }),
        group: t('gallery.upload.tagGroupCommission'),
        accent: true,
      }));
    const own = tags
      .filter((tag) => !tag.commissionTypeLabel)
      .map((tag) => ({
        value: tag.name,
        hint: t('gallery.upload.tagHintUsed', { count: tag.usageCount }),
        group: t('gallery.upload.tagGroupOwn'),
      }));
    return [...commission, ...own];
  }, [query.data, t]);
}
