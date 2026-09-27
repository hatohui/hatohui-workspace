'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@hatohui/i18n';
import { useToast } from '@hatohui/ui';
import { useBulkTagAssets } from '@hatohui/models';
import { invalidateDeletedAssetCache } from '@/hooks/invalidateDeletedAssetCache';

export function useGalleryBulkTag(selectedIds: string[]) {
  const { t } = useTranslation('art');
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  const bulkTag = useBulkTagAssets({
    mutation: {
      onSuccess: (response) => {
        toast.success(
          t('gallery.selection.tagged', {
            count: response.data.updatedIds.length,
            tags: tags.join(', '),
          }),
        );
        setTags([]);
        setIsOpen(false);
      },
      onError: () => toast.error(t('gallery.selection.tagFailed')),
      onSettled: () => invalidateDeletedAssetCache(queryClient),
    },
  });

  return {
    isOpen,
    setIsOpen,
    tags,
    setTags,
    canApply: tags.length > 0 && selectedIds.length > 0 && !bulkTag.isPending,
    isApplying: bulkTag.isPending,
    apply: () => bulkTag.mutate({ data: { ids: selectedIds, tags } }),
  };
}
