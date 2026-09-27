'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@hatohui/i18n';
import { useToast } from '@hatohui/ui';
import { useBulkDeleteAssets, type AssetDto } from '@hatohui/models';
import { invalidateDeletedAssetCache } from '@/hooks/invalidateDeletedAssetCache';

export function useGallerySelection(items: AssetDto[]) {
  const { t } = useTranslation('art');
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isSelecting, setIsSelecting] = useState(false);
  const [pickedIds, setPickedIds] = useState<ReadonlySet<string>>(new Set());
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const selectedIds = items
    .filter((asset) => pickedIds.has(asset.id))
    .map((asset) => asset.id);

  const bulkDelete = useBulkDeleteAssets({
    mutation: {
      onSuccess: (response) => {
        const count = response.data.deletedIds.length;
        toast.success(t('gallery.selection.deleted', { count }));
        setPickedIds(new Set());
        setIsSelecting(false);
      },
      onError: () => toast.error(t('gallery.selection.deleteFailed')),
      onSettled: () => invalidateDeletedAssetCache(queryClient),
    },
  });

  const toggle = (id: string) =>
    setPickedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return {
    isSelecting,
    start: () => setIsSelecting(true),
    stop: () => {
      setIsSelecting(false);
      setPickedIds(new Set());
    },
    isSelected: (id: string) => pickedIds.has(id),
    toggle,
    selectedIds,
    count: selectedIds.length,
    allSelected: items.length > 0 && selectedIds.length === items.length,
    selectAll: () => setPickedIds(new Set(items.map((asset) => asset.id))),
    clear: () => setPickedIds(new Set()),
    isConfirmOpen,
    requestDelete: () => setIsConfirmOpen(true),
    cancelDelete: () => setIsConfirmOpen(false),
    confirmDelete: () => {
      setIsConfirmOpen(false);
      bulkDelete.mutate({ data: { ids: selectedIds } });
    },
    isDeleting: bulkDelete.isPending,
  };
}

export type GallerySelection = ReturnType<typeof useGallerySelection>;
