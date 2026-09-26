'use client';

import { useState } from 'react';
import { useAuth } from '@hatohui/libs';
import { useAssets } from '@hatohui/models';
import { PROJECT_PICKER_PAGE_SIZE } from '@/constants/projects';
import { useAssetUpload } from './useAssetUpload';
import { useProjectMutations } from './useProjectMutations';

export function useArtPicker(
  projectId: string,
  existingAssetIds: string[],
  onDone: () => void,
) {
  const { user } = useAuth();
  const mutations = useProjectMutations();
  const { uploadAsset, isUploading } = useAssetUpload();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const assetsQuery = useAssets(
    {
      uploadedById: user?.id,
      sort: 'newest',
      page: 1,
      pageSize: PROJECT_PICKER_PAGE_SIZE,
    },
    { query: { enabled: !!user } },
  );
  const existing = new Set(existingAssetIds);

  const toggle = (assetId: string) =>
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(assetId)) next.delete(assetId);
      else next.add(assetId);
      return next;
    });

  const finish = () => {
    setSelected(new Set());
    onDone();
  };

  return {
    isLoading: assetsQuery.isPending,
    items: (assetsQuery.data?.data.items ?? []).map((asset) => ({
      id: asset.id,
      src: asset.thumbnailUrl ?? asset.publicUrl,
      alt: asset.filename,
      isInProject: existing.has(asset.id),
      isSelected: selected.has(asset.id),
    })),
    toggle,
    selectedCount: selected.size,
    addSelected: () => {
      if (selected.size === 0) return;
      void mutations.addAssets(projectId, [...selected]);
      finish();
    },
    isUploading,
    uploadAndAdd: async (files: File[]) => {
      const created = [];
      for (const file of files) created.push(await uploadAsset(file, []));
      await mutations.addAssets(
        projectId,
        created.map((asset) => asset.id),
      );
      finish();
    },
  };
}
