'use client';

import { useState } from 'react';
import { useAssetUpload } from '@/hooks/useAssetUpload';

export type UploadMode = 'file' | 'link';

export function useUploadDialogForm(onDone: () => void) {
  const { uploadAsset, createFromUrl, isUploading } = useAssetUpload();
  const [mode, setMode] = useState<UploadMode>('file');
  const [files, setFiles] = useState<File[]>([]);
  const [tagsInput, setTagsInput] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkFilename, setLinkFilename] = useState('');

  const reset = () => {
    setFiles([]);
    setTagsInput('');
    setLinkUrl('');
    setLinkFilename('');
  };

  const save = async () => {
    if (mode === 'file') {
      const tags = tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
      for (const file of files) {
        await uploadAsset(file, tags);
      }
    } else {
      await createFromUrl(linkUrl, linkFilename || undefined);
    }
    reset();
    onDone();
  };

  const canSave =
    mode === 'file' ? files.length > 0 : linkUrl.trim().length > 0;

  return {
    mode,
    setMode,
    files,
    setFiles,
    tagsInput,
    setTagsInput,
    linkUrl,
    setLinkUrl,
    linkFilename,
    setLinkFilename,
    isUploading,
    canSave,
    save,
  };
}
