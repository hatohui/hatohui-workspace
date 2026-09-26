'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@hatohui/i18n';
import { useAuth } from '@hatohui/libs';
import { getAssetsQueryKey } from '@hatohui/models';
import { useToast } from '@hatohui/ui';
import { useAssetUpload } from './useAssetUpload';
import { useCommissionReferenceExamples } from './useCommissionReferenceExamples';

export function useTypeExamples(tagName: string | null) {
  const { t } = useTranslation('art');
  const toast = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { uploadAsset, isUploading } = useAssetUpload();
  const { items } = useCommissionReferenceExamples(
    user?.id ?? '',
    tagName ?? undefined,
  );

  const addExamples = async (files: File[]) => {
    if (!tagName) return;
    try {
      for (const file of files) await uploadAsset(file, [tagName]);
    } catch {
      toast.error(t('app.commissionSettings.examples.uploadFailed'));
    } finally {
      void queryClient.invalidateQueries({ queryKey: getAssetsQueryKey() });
    }
  };

  return {
    canAdd: tagName !== null,
    items: items.map((asset) => ({
      id: asset.id,
      src: asset.thumbnailUrl ?? asset.publicUrl,
      alt: asset.filename,
    })),
    isUploading,
    addExamples: (files: File[]) => void addExamples(files),
  };
}
