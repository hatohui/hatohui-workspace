'use client';

import {
  useState,
  type ClipboardEvent,
  type Dispatch,
  type DragEvent,
  type SetStateAction,
} from 'react';
import type { AttachmentUploader } from './useAttachmentUpload';

const imageFilesOf = (list: FileList | null) =>
  Array.from(list ?? []).filter((file) => file.type.startsWith('image/'));

const altTextOf = (file: File) => file.name.replace(/[[\]]/g, '');

export function useMarkdownImageInsert(
  upload: AttachmentUploader,
  setValue: Dispatch<SetStateAction<string>>,
) {
  const [pending, setPending] = useState(0);
  const [hasFailed, setHasFailed] = useState(false);

  const insertAll = (files: File[], target: HTMLTextAreaElement) => {
    if (files.length === 0) return;
    setHasFailed(false);
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const tokens = files.map(
      (file, index) =>
        `![Uploading ${altTextOf(file)} #${Date.now()}${index}…]()`,
    );
    setValue(
      (prev) => `${prev.slice(0, start)}${tokens.join('\n')}${prev.slice(end)}`,
    );

    files.forEach((file, index) => {
      setPending((count) => count + 1);
      upload(file)
        .then((image) =>
          setValue((prev) =>
            prev.replace(
              tokens[index],
              `![${altTextOf(file)}](${image.publicUrl})`,
            ),
          ),
        )
        .catch(() => {
          setHasFailed(true);
          setValue((prev) => prev.replace(tokens[index], ''));
        })
        .finally(() => setPending((count) => count - 1));
    });
  };

  return {
    isUploading: pending > 0,
    hasFailed,
    onPaste: (event: ClipboardEvent<HTMLTextAreaElement>) => {
      const files = imageFilesOf(event.clipboardData.files);
      if (files.length === 0) return;
      event.preventDefault();
      insertAll(files, event.currentTarget);
    },
    onDrop: (event: DragEvent<HTMLTextAreaElement>) => {
      const files = imageFilesOf(event.dataTransfer.files);
      if (files.length === 0) return;
      event.preventDefault();
      insertAll(files, event.currentTarget);
    },
  };
}
