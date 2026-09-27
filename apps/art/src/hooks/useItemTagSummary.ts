'use client';

import { useMemo } from 'react';
import { useTranslation } from '@hatohui/i18n';
import type { TagSuggestion } from '@hatohui/ui';

export function useItemTagSummary(
  fileName: string,
  sharedTags: string[],
  ownTags: string[],
  suggestions: TagSuggestion[],
) {
  const { t } = useTranslation('art');

  return useMemo(() => {
    const shared = new Set(sharedTags.map((tag) => tag.toLowerCase()));
    const accent = new Set(
      suggestions.filter((s) => s.accent).map((s) => s.value.toLowerCase()),
    );
    const all = [
      ...sharedTags,
      ...ownTags.filter((tag) => !shared.has(tag.toLowerCase())),
    ];

    return {
      inherited: sharedTags.map((tag) => ({
        value: tag,
        accent: accent.has(tag.toLowerCase()),
      })),
      suggestions: suggestions.filter(
        (s) => !shared.has(s.value.toLowerCase()),
      ),
      count: all.length,
      hasOwn: ownTags.length > 0,
      label:
        all.length > 0
          ? t('gallery.upload.itemTagsSummary', {
              name: fileName,
              tags: all.join(', '),
            })
          : t('gallery.upload.itemTags', { name: fileName }),
    };
  }, [fileName, sharedTags, ownTags, suggestions, t]);
}
