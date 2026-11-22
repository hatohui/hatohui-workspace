import { useState } from 'react';
import { useImageUpload } from '@hatohui/libs';
import { useToast } from '@hatohui/ui';
import { useErrorMessage } from './useErrorMessage';

export function useDishPhoto(
  initialKey: string | null,
  initialUrl: string | null,
) {
  const [key, setKey] = useState<string | null>(initialKey);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl);
  const [isUploading, setIsUploading] = useState(false);
  const { uploadImage } = useImageUpload();
  const toast = useToast();
  const errorMessage = useErrorMessage();

  const pickFile = (file: File) => {
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const remove = () => {
    setPendingFile(null);
    setKey(null);
    setPreviewUrl(null);
  };

  const uploadPending = async (): Promise<{
    ok: boolean;
    imageKey: string | null;
  }> => {
    if (!pendingFile) return { ok: true, imageKey: key };
    setIsUploading(true);
    try {
      const uploaded = await uploadImage(pendingFile);
      setKey(uploaded.key);
      setPendingFile(null);
      return { ok: true, imageKey: uploaded.key };
    } catch (error) {
      toast.error(errorMessage(error));
      return { ok: false, imageKey: key };
    } finally {
      setIsUploading(false);
    }
  };

  return {
    previewUrl,
    isChanged: pendingFile !== null || key !== initialKey,
    pendingFile,
    isUploading,
    pickFile,
    remove,
    uploadPending,
  };
}
