'use client';

import { useState } from 'react';
import { useImageUpload } from '@hatohui/libs';
import {
  useCreateAsset,
  useDeleteAsset,
  useUpdateAsset,
} from '@hatohui/models';

export function useAssetUpload() {
  const { uploadImage, isUploading } = useImageUpload();
  const createAsset = useCreateAsset();
  const [isSaving, setIsSaving] = useState(false);

  const uploadAsset = async (file: File, tags: string[]) => {
    setIsSaving(true);
    try {
      const uploaded = await uploadImage(file);
      const dimensions = await readImageDimensions(file);
      await createAsset.mutateAsync({
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
  const updateAsset = useUpdateAsset();
  const deleteAsset = useDeleteAsset();

  return {
    updateTags: (id: string, tags: string[]) =>
      updateAsset.mutateAsync({ id, data: { tags } }),
    remove: (id: string) => deleteAsset.mutateAsync({ id }),
    isUpdating: updateAsset.isPending,
    isDeleting: deleteAsset.isPending,
  };
}

function readImageDimensions(
  file: File,
): Promise<{ width: number; height: number } | null> {
  if (!file.type.startsWith('image/')) return Promise.resolve(null);

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}
