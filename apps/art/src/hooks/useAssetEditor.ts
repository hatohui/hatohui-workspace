'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUpdateAsset, type AssetDto } from '@hatohui/models';
import { invalidateDeletedAssetCache } from './invalidateDeletedAssetCache';
import type { AssetDetails } from './useUploadQueue';

export function useAssetEditor(asset: AssetDto, onSaved: () => void) {
  const queryClient = useQueryClient();
  const updateAsset = useUpdateAsset();
  const [details, setDetails] = useState<AssetDetails>({
    title: asset.title ?? '',
    description: asset.description ?? '',
  });
  const [tags, setTags] = useState(asset.tags);
  const [hasError, setHasError] = useState(false);

  const save = async () => {
    setHasError(false);
    try {
      await updateAsset.mutateAsync({
        id: asset.id,
        data: { ...details, tags },
      });
      invalidateDeletedAssetCache(queryClient);
      onSaved();
    } catch {
      setHasError(true);
    }
  };

  return {
    details,
    setDetails,
    tags,
    setTags,
    save,
    hasError,
    isSaving: updateAsset.isPending,
  };
}
