'use client';

import { useState } from 'react';
import { UPLOAD_CONCURRENCY } from '@/constants/gallery';
import { useAssetUpload } from './useAssetUpload';

export type UploadStatus = 'uploading' | 'done' | 'failed';

export function useBulkAssetUpload() {
  const { uploadAsset } = useAssetUpload();
  const [statuses, setStatuses] = useState<Map<File, UploadStatus>>(
    () => new Map(),
  );
  const [isRunning, setIsRunning] = useState(false);

  const setStatus = (file: File, status: UploadStatus) =>
    setStatuses((previous) => new Map(previous).set(file, status));

  const run = async (files: File[], tags: string[]): Promise<File[]> => {
    setIsRunning(true);
    const queue = [...files];
    const failed: File[] = [];
    const worker = async () => {
      for (let file = queue.shift(); file; file = queue.shift()) {
        setStatus(file, 'uploading');
        try {
          await uploadAsset(file, tags);
          setStatus(file, 'done');
        } catch {
          setStatus(file, 'failed');
          failed.push(file);
        }
      }
    };
    await Promise.all(
      Array.from(
        { length: Math.min(UPLOAD_CONCURRENCY, files.length) },
        worker,
      ),
    );
    setIsRunning(false);
    return failed;
  };

  const reset = () => setStatuses(new Map());

  return { statuses, isRunning, run, reset };
}
