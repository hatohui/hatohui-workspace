'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getAssetTagSuggestionsQueryKey,
  getAssetsQueryKey,
} from '@hatohui/models';
import { useAssetUpload } from '@/hooks/useAssetUpload';
import { useBulkAssetUpload } from '@/hooks/useBulkAssetUpload';

export type UploadMode = 'file' | 'link';

export function useUploadDialogForm(onDone: () => void) {
  const queryClient = useQueryClient();
  const { createFromUrl, isUploading: isCreatingLink } = useAssetUpload();
  const bulk = useBulkAssetUpload();
  const [mode, setMode] = useState<UploadMode>('file');
  const [files, setFiles] = useState<File[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [failedCount, setFailedCount] = useState(0);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkFilename, setLinkFilename] = useState('');

  const reset = () => {
    setFiles([]);
    setTags([]);
    setFailedCount(0);
    setLinkUrl('');
    setLinkFilename('');
    bulk.reset();
  };

  const refreshGallery = () => {
    void queryClient.invalidateQueries({ queryKey: getAssetsQueryKey() });
    void queryClient.invalidateQueries({
      queryKey: getAssetTagSuggestionsQueryKey(),
    });
  };

  const save = async () => {
    if (mode === 'file') {
      const failed = await bulk.run(files, tags);
      refreshGallery();
      if (failed.length > 0) {
        setFiles(failed);
        setFailedCount(failed.length);
        return;
      }
    } else {
      await createFromUrl(linkUrl, linkFilename || undefined);
      refreshGallery();
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
    tags,
    setTags,
    statuses: bulk.statuses,
    failedCount,
    linkUrl,
    setLinkUrl,
    linkFilename,
    setLinkFilename,
    isUploading: bulk.isRunning || isCreatingLink,
    canSave,
    save,
  };
}
