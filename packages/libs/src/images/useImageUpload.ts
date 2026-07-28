import { useCallback, useState } from 'react';
import { SignImageDtoContentType, useSignImage } from '@hatohui/models';

export interface UploadedImage {
  key: string;
  publicUrl: string;
}

const ALLOWED_CONTENT_TYPES = new Set<string>(
  Object.values(SignImageDtoContentType),
);

export function useImageUpload() {
  const signImage = useSignImage();
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = useCallback(
    async (file: File): Promise<UploadedImage> => {
      if (!ALLOWED_CONTENT_TYPES.has(file.type)) {
        throw new Error(`Unsupported image type: ${file.type}`);
      }
      const contentType = file.type as SignImageDtoContentType;

      setIsUploading(true);
      try {
        const { data: signed } = await signImage.mutateAsync({
          data: { fileName: file.name, contentType },
        });

        const upload = await fetch(signed.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });

        if (!upload.ok) {
          throw new Error(`Failed to upload image (${upload.status})`);
        }

        return { key: signed.key, publicUrl: signed.publicUrl };
      } finally {
        setIsUploading(false);
      }
    },
    [signImage],
  );

  return { uploadImage, isUploading };
}
