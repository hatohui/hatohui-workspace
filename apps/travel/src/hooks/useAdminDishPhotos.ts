import { useState } from 'react';
import { useImageUpload } from '@hatohui/libs';
import {
  getTravelDishesQueryKey,
  useUpdateTravelDish,
  type TravelDishDto,
} from '@hatohui/models';
import type { OptimisticUpdate } from './useAdminAction';

interface CropTarget {
  dishId: string;
  file: File;
}

type RunDishMutation = <TData = unknown>(
  action: () => Promise<unknown>,
  optimistic?: OptimisticUpdate<TData>,
) => Promise<boolean>;

const dishesQueryKey = getTravelDishesQueryKey();

export function useAdminDishPhotos(run: RunDishMutation) {
  const { uploadImage } = useImageUpload();
  const update = useUpdateTravelDish();
  const [uploadingIds, setUploadingIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [cropTarget, setCropTarget] = useState<CropTarget | null>(null);

  const setUploading = (dishId: string, active: boolean) => {
    setUploadingIds((current) => {
      const next = new Set(current);
      if (active) next.add(dishId);
      else next.delete(dishId);
      return next;
    });
  };

  const uploadPhoto = async (dishId: string, file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setUploading(dishId, true);
    try {
      await run<{ data: TravelDishDto[] }>(
        async () => {
          const { key } = await uploadImage(file);
          await update.mutateAsync({ id: dishId, data: { imageKey: key } });
        },
        {
          queryKey: dishesQueryKey,
          apply: (current) => ({
            ...current,
            data: current.data.map((dish) =>
              dish.id === dishId
                ? {
                    ...dish,
                    imageUrl: previewUrl,
                    thumbnailUrl: previewUrl,
                    previewUrl,
                    coverImageUrl: previewUrl,
                  }
                : dish,
            ),
          }),
        },
      );
    } finally {
      setUploading(dishId, false);
      URL.revokeObjectURL(previewUrl);
    }
  };

  const removePhoto = async (dishId: string) => {
    setUploading(dishId, true);
    try {
      await run<{ data: TravelDishDto[] }>(
        () => update.mutateAsync({ id: dishId, data: { imageKey: null } }),
        {
          queryKey: dishesQueryKey,
          apply: (current) => ({
            ...current,
            data: current.data.map((dish) =>
              dish.id === dishId
                ? {
                    ...dish,
                    imageKey: null,
                    imageUrl: null,
                    thumbnailUrl: null,
                    previewUrl: null,
                    coverImageUrl: null,
                  }
                : dish,
            ),
          }),
        },
      );
    } finally {
      setUploading(dishId, false);
    }
  };

  return {
    cropTarget,
    openCrop: (dishId: string, file: File) => setCropTarget({ dishId, file }),
    closeCrop: () => setCropTarget(null),
    isUploading: (dishId: string) => uploadingIds.has(dishId),
    uploadPhoto,
    removePhoto,
  };
}
