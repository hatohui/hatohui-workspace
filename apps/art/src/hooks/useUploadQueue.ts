'use client';

import { useState } from 'react';
import {
  useUploadLimits,
  validateImageFile,
  type ImageFileProblem,
} from '@hatohui/libs';

export type UploadItemStatus = 'pending' | 'uploading' | 'done' | 'failed';

export interface UploadItem {
  id: string;
  file: File;
  tags: string[];
  status: UploadItemStatus;
  progress: number;
}

export interface SkippedFile {
  name: string;
  size: number;
  reason: ImageFileProblem | 'overLimit';
}

export function useUploadQueue() {
  const limits = useUploadLimits();
  const [items, setItems] = useState<UploadItem[]>([]);
  const [skipped, setSkipped] = useState<SkippedFile[]>([]);

  const add = (files: File[]) => {
    const rejected: SkippedFile[] = [];
    const accepted: UploadItem[] = [];
    let room = (limits?.maxFiles ?? Infinity) - items.length;
    for (const file of files) {
      const problem = validateImageFile(file, limits?.maxBytes);
      const skip = { name: file.name, size: file.size };
      if (problem) rejected.push({ ...skip, reason: problem });
      else if (room <= 0) rejected.push({ ...skip, reason: 'overLimit' });
      else {
        room -= 1;
        accepted.push({
          id: crypto.randomUUID(),
          file,
          tags: [],
          status: 'pending',
          progress: 0,
        });
      }
    }
    setSkipped(rejected);
    setItems((previous) => [...previous, ...accepted]);
  };

  const patch = (id: string, changes: Partial<UploadItem>) =>
    setItems((previous) =>
      previous.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    );

  return {
    items,
    skipped,
    limits,
    add,
    patch,
    remove: (id: string) =>
      setItems((previous) => previous.filter((item) => item.id !== id)),
    setItemTags: (id: string, tags: string[]) => patch(id, { tags }),
    clearDone: () =>
      setItems((previous) => previous.filter((item) => item.status !== 'done')),
    reset: () => {
      setItems([]);
      setSkipped([]);
    },
  };
}
