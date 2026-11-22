import { useState } from 'react';
import { useImageUpload } from '@hatohui/libs';
import { useToast } from '@hatohui/ui';
import { useErrorMessage } from './useErrorMessage';

export function useDishPhoto(
  initialKey: string | null,
  initialUrl: string | null,
  onChange: (key: string | null) => void,
) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl);
  const [isUploading, setIsUploading] = useState(false);
  const { uploadImage } = useImageUpload();
  const toast = useToast();
  const errorMessage = useErrorMessage();

  const pickFile = async (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsUploading(true);
    try {
      const { key } = await uploadImage(file);
      onChange(key);
    } catch (error) {
      setPreviewUrl(initialKey ? initialUrl : null);
      toast.error(errorMessage(error));
    } finally {
      setIsUploading(false);
    }
  };

  const remove = () => {
    setPreviewUrl(null);
    onChange(null);
  };

  return { previewUrl, isUploading, pickFile, remove };
}
