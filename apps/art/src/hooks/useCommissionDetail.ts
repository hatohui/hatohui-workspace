'use client';

import {
  useCommission,
  useUpdateCommissionStatus,
  useUpdateCommissionPaymentStatus,
  useUpdateCommissionStep,
  useUpdateCommissionQuote,
  useUpdateCommissionVisibility,
  useDeliverCommission,
  useCreateCommissionNote,
  getCommissionQueryKey,
  type UpdateCommissionStatusDtoStatus,
  type UpdatePaymentStatusDtoPaymentStatus,
  type CreateCommentDtoVisibility,
} from '@hatohui/models';
import { useQueryClient } from '@tanstack/react-query';
import { useImageUpload } from '@hatohui/libs';
import type { CommissionStepKey } from '@/constants/commission';

export function useCommissionDetail(id: string) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getCommissionQueryKey(id) });

  const commissionQuery = useCommission(id);
  const updateStatus = useUpdateCommissionStatus({
    mutation: { onSuccess: invalidate },
  });
  const updatePaymentStatus = useUpdateCommissionPaymentStatus({
    mutation: { onSuccess: invalidate },
  });
  const updateStep = useUpdateCommissionStep({
    mutation: { onSuccess: invalidate },
  });
  const updateQuote = useUpdateCommissionQuote({
    mutation: { onSuccess: invalidate },
  });
  const updateVisibility = useUpdateCommissionVisibility({
    mutation: { onSuccess: invalidate },
  });
  const deliver = useDeliverCommission({ mutation: { onSuccess: invalidate } });
  const createNote = useCreateCommissionNote({
    mutation: { onSuccess: invalidate },
  });
  const { uploadImage, isUploading } = useImageUpload();

  return {
    commission: commissionQuery.data?.data,
    isLoading: commissionQuery.isPending,

    setStatus: (status: UpdateCommissionStatusDtoStatus, note?: string) =>
      updateStatus.mutateAsync({ id, data: { status, note } }),

    setPaymentStatus: (paymentStatus: UpdatePaymentStatusDtoPaymentStatus) =>
      updatePaymentStatus.mutateAsync({ id, data: { paymentStatus } }),

    toggleStep: (step: CommissionStepKey, done: boolean) =>
      updateStep.mutateAsync({ id, data: { step, done } }),

    setQuote: (data: {
      commissionTypeId?: string | null;
      optionKey?: string | null;
      addonKeys?: string[];
      quote?: number | null;
    }) => updateQuote.mutateAsync({ id, data }),

    setVisibility: (isHiddenInQueue: boolean) =>
      updateVisibility.mutateAsync({ id, data: { isHiddenInQueue } }),

    deliver: async (files: File[]) => {
      const uploaded = await Promise.all(
        files.map((file) => uploadImage(file)),
      );
      return deliver.mutateAsync({
        id,
        data: { images: uploaded.map((asset) => asset.key) },
      });
    },
    isDelivering: deliver.isPending || isUploading,

    addNote: (body: string, visibility: CreateCommentDtoVisibility) =>
      createNote.mutateAsync({ id, data: { body, visibility } }),
  };
}
