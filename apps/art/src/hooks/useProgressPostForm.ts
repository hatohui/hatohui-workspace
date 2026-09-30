'use client';

import { useState } from 'react';
import type {
  CreateCommissionProgressDto,
  CreateCommissionProgressDtoVisibility as Visibility,
} from '@hatohui/models';
import type { AttachmentUploader } from './useAttachmentUpload';
import { useMarkdownImageInsert } from './useMarkdownImageInsert';

export function useProgressPostForm(
  upload: AttachmentUploader,
  create: (
    data: Omit<CreateCommissionProgressDto, 'commissionId'>,
  ) => Promise<unknown>,
) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [visibility, setVisibility] = useState<Visibility>('CLIENT');
  const [isFinal, setIsFinal] = useState(false);
  const [requestsApproval, setRequestsApproval] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const inline = useMarkdownImageInsert(upload, setDescription);

  const hasContent =
    Boolean(title.trim() || description.trim()) || files.length > 0;

  const submit = async () => {
    if (!hasContent || isPosting || inline.isUploading) return;
    setIsPosting(true);
    try {
      const uploaded = await Promise.all(files.map((file) => upload(file)));
      await create({
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        images: uploaded.map((image) => image.key),
        visibility,
        isFinal,
        requestsApproval: visibility === 'CLIENT' && requestsApproval,
      });
      setTitle('');
      setDescription('');
      setFiles([]);
      setIsFinal(false);
      setRequestsApproval(false);
    } finally {
      setIsPosting(false);
    }
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    inline,
    files,
    setFiles,
    visibility,
    setVisibility,
    isFinal,
    setIsFinal,
    requestsApproval,
    setRequestsApproval,
    isBusy: isPosting || inline.isUploading,
    canPost: hasContent && !isPosting && !inline.isUploading,
    submit,
  };
}
