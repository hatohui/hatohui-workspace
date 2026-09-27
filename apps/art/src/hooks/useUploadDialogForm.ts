'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getAssetTagSuggestionsQueryKey,
  getAssetsQueryKey,
} from '@hatohui/models';
import { useAssetUpload } from '@/hooks/useAssetUpload';
import { useUploadQueue } from '@/hooks/useUploadQueue';
import { useUploadQueueRunner } from '@/hooks/useUploadQueueRunner';

export type UploadMode = 'file' | 'link';

export function useUploadDialogForm(onDone: () => void) {
  const queryClient = useQueryClient();
  const { createFromUrl, isUploading: isCreatingLink } = useAssetUpload();
  const queue = useUploadQueue();
  const runner = useUploadQueueRunner(queue.patch);
  const [mode, setMode] = useState<UploadMode>('file');
  const [tags, setTags] = useState<string[]>([]);
  const [failedCount, setFailedCount] = useState(0);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkFilename, setLinkFilename] = useState('');

  const reset = () => {
    queue.reset();
    setTags([]);
    setFailedCount(0);
    setLinkUrl('');
    setLinkFilename('');
  };

  const refreshGallery = () => {
    void queryClient.invalidateQueries({ queryKey: getAssetsQueryKey() });
    void queryClient.invalidateQueries({
      queryKey: getAssetTagSuggestionsQueryKey(),
    });
  };

  const save = async () => {
    if (mode === 'file') {
      const failed = await runner.run(queue.items, tags);
      refreshGallery();
      if (failed > 0) {
        queue.clearDone();
        setFailedCount(failed);
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
    mode === 'file' ? queue.items.length > 0 : linkUrl.trim().length > 0;

  return {
    mode,
    setMode,
    queue,
    tags,
    setTags,
    failedCount,
    linkUrl,
    setLinkUrl,
    linkFilename,
    setLinkFilename,
    isUploading: runner.isRunning || isCreatingLink,
    canSave,
    save,
  };
}
