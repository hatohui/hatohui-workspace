'use client';

import { useState } from 'react';
import type { UploadedImage } from '@hatohui/libs';
import { COMMENT_IMAGE_LIMIT } from '@/constants/comments';
import type { AttachmentUploader } from './useAttachmentUpload';
import { useMarkdownImageInsert } from './useMarkdownImageInsert';
import { inlineImagesOf, withoutMarkdown } from '@/lib/markdownImages';

export interface CommentInput {
  body: string;
  keys: string[];
}

export interface ComposerPreview {
  id: string;
  src: string | null;
  isUploading: boolean;
  onRemove: () => void;
}

interface Attachment {
  id: string;
  preview: string;
  image: UploadedImage | null;
}

export function useCommentComposer(
  onAdd: (input: CommentInput) => Promise<unknown>,
  upload: AttachmentUploader,
) {
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const inline = useMarkdownImageInsert(upload, setBody);

  const isUploading =
    inline.isUploading || attachments.some((item) => !item.image);
  const hasContent = Boolean(body.trim()) || attachments.length > 0;

  const attach = (files: File[]) => {
    setHasFailed(false);
    const room = COMMENT_IMAGE_LIMIT - attachments.length;
    files.slice(0, room).forEach((file) => {
      const id = crypto.randomUUID();
      const preview = URL.createObjectURL(file);
      setAttachments((prev) => [...prev, { id, preview, image: null }]);
      upload(file)
        .then((image) =>
          setAttachments((prev) =>
            prev.map((item) => (item.id === id ? { ...item, image } : item)),
          ),
        )
        .catch(() => {
          setHasFailed(true);
          URL.revokeObjectURL(preview);
          setAttachments((prev) => prev.filter((item) => item.id !== id));
        });
    });
  };

  const remove = (id: string) =>
    setAttachments((prev) => {
      const item = prev.find((entry) => entry.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((entry) => entry.id !== id);
    });

  const previews: ComposerPreview[] = [
    ...inlineImagesOf(body).map((image, index) => ({
      id: `inline-${index}-${image.markdown}`,
      src: image.url || null,
      isUploading: !image.url,
      onRemove: () => setBody((prev) => withoutMarkdown(prev, image.markdown)),
    })),
    ...attachments.map((item) => ({
      id: item.id,
      src: item.preview,
      isUploading: !item.image,
      onRemove: () => remove(item.id),
    })),
  ];

  const send = async () => {
    if (!hasContent || isUploading || isSending) return;
    setIsSending(true);
    setHasFailed(false);
    try {
      await onAdd({
        body: body.trim(),
        keys: attachments.flatMap((item) =>
          item.image ? [item.image.key] : [],
        ),
      });
      attachments.forEach((item) => URL.revokeObjectURL(item.preview));
      setBody('');
      setAttachments([]);
    } catch {
      setHasFailed(true);
    } finally {
      setIsSending(false);
    }
  };

  return {
    body,
    setBody,
    inline,
    previews,
    canAttach: attachments.length < COMMENT_IMAGE_LIMIT,
    attach,
    canSend: hasContent && !isUploading && !isSending,
    isBusy: isUploading || isSending,
    hasFailed: hasFailed || inline.hasFailed,
    send,
  };
}
