'use client';

import { useState } from 'react';
import { putToSignedUrl, signImageFiles } from '@hatohui/libs';
import { useCreateAsset } from '@hatohui/models';
import { UPLOAD_CONCURRENCY } from '@/constants/gallery';
import { readImageDimensions } from '@/lib/imageDimensions';
import type { UploadItem } from './useUploadQueue';

export function useUploadQueueRunner(
  patch: (id: string, changes: Partial<UploadItem>) => void,
) {
  const createAsset = useCreateAsset();
  const [isRunning, setIsRunning] = useState(false);

  const uploadOne = async (
    item: UploadItem,
    url: string,
    key: string,
    sharedTags: string[],
  ) => {
    patch(item.id, { status: 'uploading', progress: 0 });
    await putToSignedUrl(url, item.file, (progress) =>
      patch(item.id, { progress }),
    );
    const dimensions = await readImageDimensions(item.file);
    await createAsset.mutateAsync({
      data: {
        key,
        filename: item.file.name,
        contentType: item.file.type,
        size: item.file.size,
        width: dimensions?.width,
        height: dimensions?.height,
        tags: [...new Set([...sharedTags, ...item.tags])],
      },
    });
    patch(item.id, { status: 'done', progress: 1 });
  };

  const run = async (items: UploadItem[], sharedTags: string[]) => {
    const queue = items.filter((item) => item.status !== 'done');
    if (queue.length === 0) return 0;
    setIsRunning(true);
    let failed = 0;
    try {
      const signed = await signImageFiles(queue.map((item) => item.file));
      const jobs = queue.map((item, index) => ({
        item,
        signed: signed[index],
      }));
      const worker = async () => {
        for (let job = jobs.shift(); job; job = jobs.shift()) {
          try {
            await uploadOne(
              job.item,
              job.signed.uploadUrl,
              job.signed.key,
              sharedTags,
            );
          } catch {
            failed += 1;
            patch(job.item.id, { status: 'failed', progress: 0 });
          }
        }
      };
      await Promise.all(
        Array.from(
          { length: Math.min(UPLOAD_CONCURRENCY, jobs.length) },
          worker,
        ),
      );
    } catch {
      failed = queue.length;
      queue.forEach((item) =>
        patch(item.id, { status: 'failed', progress: 0 }),
      );
    } finally {
      setIsRunning(false);
    }
    return failed;
  };

  return { run, isRunning };
}
