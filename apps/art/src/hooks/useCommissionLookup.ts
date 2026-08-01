'use client';

import { useState } from 'react';
import {
  useLookupCommissionsByEmail,
  useLookupCommissionByCode,
  useAddCommissionReferenceAssets,
  useAddClientCommissionNote,
  getLookupCommissionByCodeQueryKey,
} from '@hatohui/models';
import { useQueryClient } from '@tanstack/react-query';
import { useImageUpload } from '@hatohui/libs';

export function useCommissionEmailLookup() {
  const [email, setEmail] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const lookupQuery = useLookupCommissionsByEmail(
    { email: submittedEmail ?? '' },
    { query: { enabled: submittedEmail !== null } },
  );

  return {
    email,
    setEmail,
    search: () => setSubmittedEmail(email),
    items: lookupQuery.data?.data ?? [],
    isLoading: lookupQuery.isPending && submittedEmail !== null,
    hasSearched: submittedEmail !== null,
  };
}

export function useCommissionCodeLookup(code: string) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: getLookupCommissionByCodeQueryKey(code),
    });

  const detailQuery = useLookupCommissionByCode(code);
  const addReferenceAssets = useAddCommissionReferenceAssets({
    mutation: { onSuccess: invalidate },
  });
  const addNote = useAddClientCommissionNote({
    mutation: { onSuccess: invalidate },
  });
  const { uploadImage, isUploading } = useImageUpload();

  return {
    commission: detailQuery.data?.data,
    isLoading: detailQuery.isPending,

    addReferenceAssets: async (files: File[]) => {
      const uploaded = await Promise.all(
        files.map((file) => uploadImage(file)),
      );
      return addReferenceAssets.mutateAsync({
        code,
        data: { keys: uploaded.map((asset) => asset.key) },
      });
    },
    isUploadingReferences: isUploading || addReferenceAssets.isPending,

    addNote: (body: string) => addNote.mutateAsync({ code, data: { body } }),
  };
}
