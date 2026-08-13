import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorCategory } from '../errors/getErrorCategory';
import { resizeImageToSquare } from '../images/resizeImageToSquare';
import { useImageUpload } from '../images/useImageUpload';

type StageError = 'unauthorized' | 'unknown';

/// Stages a resized avatar file locally (object-URL preview only) instead of
/// uploading it right away, so picking a file — then never hitting Save —
/// never creates an orphaned storage object. The actual upload happens in
/// `commit()`, called from the form's submit handler.
export function useStagedAvatar(initialUrl: string | null) {
  const [previewUrl, setPreviewUrl] = useState(initialUrl);
  const [isStaging, setIsStaging] = useState(false);
  const [error, setError] = useState<StageError | null>(null);
  const stagedFileRef = useRef<File | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const { uploadImage, isUploading } = useImageUpload();

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  const stageFile = useCallback(async (file: File) => {
    setError(null);
    setIsStaging(true);
    try {
      const squared = await resizeImageToSquare(file);
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      const url = URL.createObjectURL(squared);
      objectUrlRef.current = url;
      stagedFileRef.current = squared;
      setPreviewUrl(url);
    } catch {
      setError('unknown');
    } finally {
      setIsStaging(false);
    }
  }, []);

  const setRestoredPreview = useCallback((url: string) => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    stagedFileRef.current = null;
    setPreviewUrl(url);
  }, []);

  const commit = useCallback(async (): Promise<string | undefined> => {
    if (!stagedFileRef.current) return undefined;
    try {
      const uploaded = await uploadImage(stagedFileRef.current);
      return uploaded.key;
    } catch (err) {
      setError(
        getErrorCategory(err) === 'unauthorized' ? 'unauthorized' : 'unknown',
      );
      throw err;
    }
  }, [uploadImage]);

  return {
    previewUrl,
    stageFile,
    setRestoredPreview,
    commit,
    isBusy: isStaging || isUploading,
    error,
  };
}
