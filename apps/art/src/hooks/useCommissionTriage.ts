'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  useCommissions,
  useUpdateCommissionStatus,
  useUpdateCommissionPriority,
  useUpdateCommissionQuote,
  useUpdateCommissionPaymentStatus,
  useDeleteCommission,
  useSendCommissionConfirmationEmail,
  getCommissionsQueryKey,
  type CommissionDto,
  type CommissionsStatus,
  type CommissionsSort,
  type CommissionsDirection,
} from '@hatohui/models';

export function useCommissionTriage(
  status: CommissionsStatus,
  sort: CommissionsSort,
  direction: CommissionsDirection,
) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getCommissionsQueryKey() });

  const listQuery = useCommissions({ status, sort, direction, pageSize: 100 });
  const updateStatus = useUpdateCommissionStatus({
    mutation: { onSuccess: invalidate },
  });
  const updatePriority = useUpdateCommissionPriority({
    mutation: { onSuccess: invalidate },
  });
  const updateQuote = useUpdateCommissionQuote({
    mutation: { onSuccess: invalidate },
  });
  const updatePaymentStatus = useUpdateCommissionPaymentStatus({
    mutation: { onSuccess: invalidate },
  });
  const remove = useDeleteCommission({ mutation: { onSuccess: invalidate } });
  const sendConfirmation = useSendCommissionConfirmationEmail();

  return {
    items: listQuery.data?.data.items ?? [],
    isLoading: listQuery.isPending,
    setStatus: (id: string, next: CommissionsStatus, note?: string) =>
      updateStatus.mutateAsync({ id, data: { status: next, note } }),
    setPriority: (id: string, priority: number | null) =>
      updatePriority.mutateAsync({ id, data: { priority } }),
    setQuote: (id: string, quote: number | null) =>
      updateQuote.mutateAsync({ id, data: { quote } }),
    setPaymentStatus: (
      id: string,
      paymentStatus: CommissionDto['paymentStatus'],
    ) => updatePaymentStatus.mutateAsync({ id, data: { paymentStatus } }),
    remove: (id: string) => remove.mutateAsync({ id }),
    sendConfirmation: (id: string, note?: string) =>
      sendConfirmation.mutateAsync({ id, data: { note } }),
  };
}
