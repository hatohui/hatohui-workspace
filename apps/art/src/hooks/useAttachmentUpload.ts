'use client';

import { useCallback } from 'react';
import {
  putToSignedUrl,
  useUploadLimits,
  validateImageFile,
  type UploadedImage,
} from '@hatohui/libs';
import {
  useSignClientCommissionAttachment,
  useSignCommissionAttachment,
  type SignImageDto,
  type SignImageDtoContentType,
  type SignedImageDto,
} from '@hatohui/models';

export type AttachmentUploader = (file: File) => Promise<UploadedImage>;

function useSignedUploader(
  sign: (data: SignImageDto) => Promise<{ data: SignedImageDto }>,
): AttachmentUploader {
  const limits = useUploadLimits();

  return useCallback(
    async (file: File) => {
      const problem = validateImageFile(file, limits?.maxBytes);
      if (problem) throw new Error(problem);
      const { data: signed } = await sign({
        fileName: file.name,
        contentType: file.type as SignImageDtoContentType,
        size: file.size,
      });
      await putToSignedUrl(signed.uploadUrl, file);
      return { key: signed.key, publicUrl: signed.publicUrl };
    },
    [sign, limits],
  );
}

export function useClientAttachmentUpload(code: string): AttachmentUploader {
  const { mutateAsync } = useSignClientCommissionAttachment();
  return useSignedUploader(
    useCallback((data) => mutateAsync({ code, data }), [mutateAsync, code]),
  );
}

export function useArtistAttachmentUpload(
  commissionId: string,
): AttachmentUploader {
  const { mutateAsync } = useSignCommissionAttachment();
  return useSignedUploader(
    useCallback(
      (data) => mutateAsync({ commissionId, data }),
      [mutateAsync, commissionId],
    ),
  );
}
