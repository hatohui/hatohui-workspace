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
}

const fromImages = (images: TravelImageDto[]): PhotoItem[] =>
  images.map((image) => ({ id: image.key, key: image.key, url: image.url }));

export function usePhotoList(initial: TravelImageDto[]) {
  const [photos, setPhotos] = useState<PhotoItem[]>(() => fromImages(initial));
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

  const addFiles = async (files: File[]) => {
    const room = MAX_PHOTOS - photos.length;
    const pending = files.slice(0, Math.max(room, 0)).map((file) => ({
      file,
      photo: {
        id: crypto.randomUUID(),
        key: null,
        url: URL.createObjectURL(file),
      },
    }));
    setPhotos((list) => [...list, ...pending.map((p) => p.photo)]);
    await Promise.all(
      pending.map(async ({ file, photo }) => {
        try {
          const { key } = await uploadImage(file);
          patch(photo.id, { key });
        } catch (error) {
          patch(photo.id, null);
          toast.error(errorMessage(error));
        }
      }),
    );
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
    remove: (id: string) => patch(id, null),
    makeCover,
    reset,
    keys: photos.flatMap((photo) => (photo.key ? [photo.key] : [])),
    isUploading: photos.some((photo) => !photo.key),
    isFull: photos.length >= MAX_PHOTOS,
  };
}
