'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { readImageDimensions } from '@/lib/imageDimensions';
import { useImageUpload } from '@hatohui/libs';
import {
  useCreateAsset,
  useDeleteAsset,
  useUpdateAsset,
} from '@hatohui/models';
import { invalidateDeletedAssetCache } from '@/hooks/invalidateDeletedAssetCache';

export function useAssetUpload() {
  const { uploadImage, isUploading } = useImageUpload();
  const createAsset = useCreateAsset();
  const [isSaving, setIsSaving] = useState(false);

  const uploadAsset = async (file: File, tags: string[]) => {
    setIsSaving(true);
    try {
      const uploaded = await uploadImage(file);
      const dimensions = await readImageDimensions(file);
      const created = await createAsset.mutateAsync({
        data: {
          key: uploaded.key,
          filename: file.name,
          contentType: file.type,
          size: file.size,
          width: dimensions?.width,
          height: dimensions?.height,
          tags,
        },
      });
      return created.data;
    } finally {
      setIsSaving(false);
    }
  };

  const createFromUrl = async (externalUrl: string, filename?: string) => {
    setIsSaving(true);
    try {
      await createAsset.mutateAsync({
        data: { externalUrl, filename },
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    uploadAsset,
    createFromUrl,
    isUploading: isUploading || isSaving,
  };
}

export function useAssetManagement() {
  const queryClient = useQueryClient();
  const updateAsset = useUpdateAsset();
  const deleteAsset = useDeleteAsset({
    mutation: { onSettled: () => invalidateDeletedAssetCache(queryClient) },
  });

  return {
    updateTags: (id: string, tags: string[]) =>
      updateAsset.mutateAsync({ id, data: { tags } }),
    remove: (id: string) => deleteAsset.mutateAsync({ id }),
    isUpdating: updateAsset.isPending,
    isDeleting: deleteAsset.isPending,
  };
}
