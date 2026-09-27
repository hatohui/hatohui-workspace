'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUpdateAsset, type AssetDto } from '@hatohui/models';
import type { AssetDetails } from './useUploadQueue';

const detailsOf = (asset: AssetDto): AssetDetails => ({
  title: asset.title ?? '',
  description: asset.description ?? '',
});

export function useArtworkDetailsEditor(asset: AssetDto) {
  const router = useRouter();
  const updateAsset = useUpdateAsset();
  const [saved, setSaved] = useState(detailsOf(asset));
  const [details, setDetails] = useState(saved);
  const [hasError, setHasError] = useState(false);

  const isDirty =
    details.title.trim() !== saved.title.trim() ||
    details.description.trim() !== saved.description.trim();

  const save = async () => {
    setHasError(false);
    try {
      const updated = await updateAsset.mutateAsync({
        id: asset.id,
        data: { title: details.title, description: details.description },
      });
      const next = detailsOf(updated.data);
      setSaved(next);
      setDetails(next);
      router.refresh();
    } catch {
      setHasError(true);
    }
  };

  return {
    details,
    setDetails,
    isDirty,
    isSaving: updateAsset.isPending,
    hasError,
    save,
    discard: () => setDetails(saved),
  };
}
