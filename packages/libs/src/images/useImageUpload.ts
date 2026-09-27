import { useCallback, useState } from 'react';
import { SignImageDtoContentType, useSignImage } from '@hatohui/models';
import { validateImageFile } from './validateImageFile';
import { putToSignedUrl } from './putToSignedUrl';
import { useUploadLimits } from './useUploadLimits';

export interface UploadedImage {
  key: string;
  publicUrl: string;
}

export function useImageUpload() {
  const signImage = useSignImage();
  const limits = useUploadLimits();
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = useCallback(
    async (file: File, uploaderName?: string): Promise<UploadedImage> => {
      const problem = validateImageFile(file, limits?.maxBytes);
      if (problem === 'unsupportedType') {
        throw new Error(`Unsupported image type: ${file.type}`);
      }
      if (problem === 'tooLarge') {
        throw new Error(`Image is larger than ${limits?.maxBytes} bytes`);
      }
      const contentType = file.type as SignImageDtoContentType;

      setIsUploading(true);
      try {
        const { data: signed } = await signImage.mutateAsync({
          data: {
            fileName: file.name,
            contentType,
            size: file.size,
            uploaderName,
          },
        });

        await putToSignedUrl(signed.uploadUrl, file);

        return { key: signed.key, publicUrl: signed.publicUrl };
      } finally {
        setIsUploading(false);
      }
    },
    [signImage, limits],
  );

  return { uploadImage, isUploading };
}
