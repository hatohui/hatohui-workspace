'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getAssetTagSuggestionsQueryKey,
  getAssetsQueryKey,
} from '@hatohui/models';
import { useUploadQueue, type UploadItem } from '@/hooks/useUploadQueue';
import { useUploadQueueRunner } from '@/hooks/useUploadQueueRunner';

export function useUploadDialogForm(onDone: () => void) {
  const queryClient = useQueryClient();
  const queue = useUploadQueue();
  const runner = useUploadQueueRunner(queue.patch);
  const [tags, setTags] = useState<string[]>([]);
  const [failedCount, setFailedCount] = useState(0);

  const reset = () => {
    queue.reset();
    setTags([]);
    setFailedCount(0);
  };

  const refreshGallery = () => {
    void queryClient.invalidateQueries({ queryKey: getAssetsQueryKey() });
    void queryClient.invalidateQueries({
      queryKey: getAssetTagSuggestionsQueryKey(),
    });
  };

  const uploadFiles = async (items: UploadItem[]) => {
    const failed = await runner.run(items, tags);
    refreshGallery();
    if (failed > 0) {
      queue.clearDone();
      setFailedCount(failed);
      return;
    }
    reset();
    onDone();
  };

  const compressAndUpload = async () => {
    const added = await queue.compressOversized();
    if (added.length > 0) await uploadFiles([...queue.items, ...added]);
  };

  const save = () => uploadFiles(queue.items);

  const canSave = queue.items.length > 0;

  return {
    queue,
    tags,
    setTags,
    failedCount,
    isUploading: runner.isRunning || queue.isCompressing,
    canSave,
    save,
    compressAndUpload,
  };
}
