import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useImageUpload } from '@hatohui/libs';
import {
  getTravelPlanGalleryQueryKey,
  useAddTravelActivityMedia,
  useAddTravelGroupImage,
  useDeleteTravelActivityMedia,
  useDeleteTravelGroupImage,
  useTravelPlanGallery,
  type TravelMediaItemDto,
} from '@hatohui/models';

export function useTravelGallery(participationId: string) {
  const queryClient = useQueryClient();
  const { uploadImage } = useImageUpload();

  const [activityId, setActivityId] = useState('');
  const [uploadedById, setUploadedById] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [activePhoto, setActivePhoto] = useState<TravelMediaItemDto | null>(
    null,
  );

  const queryParams = {
    activityId: activityId || undefined,
    uploadedById: uploadedById || undefined,
  };

  const galleryQuery = useTravelPlanGallery(participationId, queryParams);
  const addGroupMutation = useAddTravelGroupImage();
  const deleteGroupMutation = useDeleteTravelGroupImage();
  const addActivityMutation = useAddTravelActivityMedia();
  const deleteActivityMutation = useDeleteTravelActivityMedia();

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: getTravelPlanGalleryQueryKey(participationId),
    });

  const uploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const uploaded = await uploadImage(file);
        if (activityId) {
          await addActivityMutation.mutateAsync({
            id: participationId,
            activityId,
            data: { key: uploaded.key },
          });
        } else {
          await addGroupMutation.mutateAsync({
            id: participationId,
            data: { key: uploaded.key },
          });
        }
      }
      await invalidate();
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = async (item: TravelMediaItemDto) => {
    if (item.source === 'ACTIVITY' && item.activityId) {
      await deleteActivityMutation.mutateAsync({
        id: participationId,
        activityId: item.activityId,
        mediaId: item.id,
      });
    } else {
      await deleteGroupMutation.mutateAsync({
        id: participationId,
        imageId: item.id,
      });
    }
    setActivePhoto(null);
    await invalidate();
  };

  return {
    items: galleryQuery.data?.data ?? [],
    isLoading: galleryQuery.isLoading,
    activityId,
    setActivityId,
    uploadedById,
    setUploadedById,
    isUploading,
    uploadFiles,
    activePhoto,
    setActivePhoto,
    removePhoto,
  };
}
