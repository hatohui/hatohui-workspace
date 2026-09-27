'use client';

import { useState } from 'react';
import {
  compressImageToFit,
  useUploadLimits,
  validateImageFile,
  type ImageFileProblem,
} from '@hatohui/libs';

export type UploadItemStatus = 'pending' | 'uploading' | 'done' | 'failed';

export interface AssetDetails {
  title: string;
  description: string;
}

export interface UploadItem extends AssetDetails {
  id: string;
  file: File;
  tags: string[];
  status: UploadItemStatus;
  progress: number;
}

export interface SkippedFile {
  file: File;
  reason: ImageFileProblem | 'overLimit' | 'compressFailed';
}

const toItem = (file: File): UploadItem => ({
  id: crypto.randomUUID(),
  file,
  tags: [],
  title: '',
  description: '',
  status: 'pending',
  progress: 0,
});

export function useUploadQueue() {
  const limits = useUploadLimits();
  const [items, setItems] = useState<UploadItem[]>([]);
  const [skipped, setSkipped] = useState<SkippedFile[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);

  const admit = (files: File[]) => {
    const rejected: SkippedFile[] = [];
    const accepted: UploadItem[] = [];
    let room = (limits?.maxFiles ?? Infinity) - items.length;
    for (const file of files) {
      const problem = validateImageFile(file, limits?.maxBytes);
      if (problem) rejected.push({ file, reason: problem });
      else if (room <= 0) rejected.push({ file, reason: 'overLimit' });
      else {
        room -= 1;
        accepted.push(toItem(file));
      }
    }
    setItems((previous) => [...previous, ...accepted]);
    return { accepted, rejected };
  };

  const compressOversized = async (): Promise<UploadItem[]> => {
    const maxBytes = limits?.maxBytes;
    const oversized = skipped.filter((entry) => entry.reason === 'tooLarge');
    if (!maxBytes || oversized.length === 0) return [];
    setIsCompressing(true);
    const compressed: File[] = [];
    const failed: SkippedFile[] = [];
    for (const { file } of oversized) {
      try {
        compressed.push(await compressImageToFit(file, maxBytes));
      } catch {
        failed.push({ file, reason: 'compressFailed' });
      }
    }
    setIsCompressing(false);
    const { accepted, rejected } = admit(compressed);
    setSkipped((previous) => [
      ...previous.filter((entry) => entry.reason !== 'tooLarge'),
      ...failed,
      ...rejected,
    ]);
    return accepted;
  };

  const patch = (id: string, changes: Partial<UploadItem>) =>
    setItems((previous) =>
      previous.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    );

  return {
    items,
    skipped,
    limits,
    isCompressing,
    canCompress: skipped.some((entry) => entry.reason === 'tooLarge'),
    add: (files: File[]) => setSkipped(admit(files).rejected),
    compressOversized,
    patch,
    remove: (id: string) =>
      setItems((previous) => previous.filter((item) => item.id !== id)),
    setItemTags: (id: string, tags: string[]) => patch(id, { tags }),
    setItemDetails: (id: string, details: AssetDetails) => patch(id, details),
    clearDone: () =>
      setItems((previous) => previous.filter((item) => item.status !== 'done')),
    reset: () => {
      setItems([]);
      setSkipped([]);
    },
  };
}
