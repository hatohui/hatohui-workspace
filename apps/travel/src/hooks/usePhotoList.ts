import { useCallback, useState } from 'react';
import type { TravelImageDto } from '@hatohui/models';
import { useImageUpload } from '@hatohui/libs';
import { useToast } from '@hatohui/ui';
import { MAX_PHOTOS } from '../constants/travel';
import { useErrorMessage } from './useErrorMessage';

export interface PhotoItem {
  id: string;
  key: string | null;
  url: string;
  file?: File;
  uploading?: boolean;
}

const fromImages = (images: TravelImageDto[]): PhotoItem[] =>
  images.map((image) => ({
    id: image.key,
    key: image.key,
    url: image.thumbnailUrl ?? image.url,
  }));

export function usePhotoList(initial: TravelImageDto[]) {
  const [photos, setPhotos] = useState<PhotoItem[]>(() => fromImages(initial));
  const [isUploading, setIsUploading] = useState(false);
  const { uploadImage } = useImageUpload();
  const toast = useToast();
  const errorMessage = useErrorMessage();

  const patch = (id: string, change: Partial<PhotoItem> | null) =>
    setPhotos((list) =>
      change === null
        ? list.filter((photo) => photo.id !== id)
        : list.map((photo) =>
            photo.id === id ? { ...photo, ...change } : photo,
          ),
    );

  const addFiles = (files: File[]) => {
    setPhotos((list) => {
      const room = MAX_PHOTOS - list.length;
      const queued = files.slice(0, Math.max(room, 0)).map((file) => ({
        id: crypto.randomUUID(),
        key: null,
        url: URL.createObjectURL(file),
        file,
      }));
      return [...list, ...queued];
    });
  };

  const uploadPending = async (): Promise<string[] | null> => {
    const pending = photos.filter((photo) => !photo.key && photo.file);
    if (pending.length === 0) {
      return photos.flatMap((photo) => (photo.key ? [photo.key] : []));
    }

    setIsUploading(true);
    const uploadedKeys = new Map<string, string>();
    let failed = false;

    await Promise.all(
      pending.map(async (photo) => {
        patch(photo.id, { uploading: true });
        try {
          const { key } = await uploadImage(photo.file);
          uploadedKeys.set(photo.id, key);
          patch(photo.id, { key, file: undefined, uploading: false });
        } catch (error) {
          failed = true;
          patch(photo.id, { uploading: false });
          toast.error(errorMessage(error));
        }
      }),
    );

    setIsUploading(false);
    if (failed) return null;

    return photos.flatMap((photo) => {
      const key = photo.key ?? uploadedKeys.get(photo.id);
      return key ? [key] : [];
    });
  };

  const makeCover = (id: string) =>
    setPhotos((list) => {
      const photo = list.find((item) => item.id === id);
      return photo ? [photo, ...list.filter((item) => item.id !== id)] : list;
    });

  const reset = useCallback(
    (images: TravelImageDto[]) => setPhotos(fromImages(images)),
    [],
  );

  return {
    photos,
    addFiles,
    uploadPending,
    remove: (id: string) => patch(id, null),
    makeCover,
    reset,
    isUploading,
    isFull: photos.length >= MAX_PHOTOS,
  };
}
