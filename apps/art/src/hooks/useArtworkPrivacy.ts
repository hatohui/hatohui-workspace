'use client';

import { useRouter } from 'next/navigation';
import type { AssetDto } from '@hatohui/models';
import { useAssetManagement } from './useAssetUpload';

export function useArtworkPrivacy(asset: AssetDto) {
  const router = useRouter();
  const { setPrivate, isUpdating } = useAssetManagement();

  return {
    isPrivate: asset.isPrivate,
    isPrivateViaProject: asset.inPrivateProject && !asset.isPrivate,
    isUpdating,
    setPrivate: async (isPrivate: boolean) => {
      await setPrivate(asset.id, isPrivate);
      router.refresh();
    },
  };
}
