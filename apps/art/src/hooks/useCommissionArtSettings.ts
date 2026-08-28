'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  useCommissionSettings,
  useUpdateCommissionSettings,
  usePaymentMethods,
  getCommissionSettingsQueryKey,
} from '@hatohui/models';
import type { CommissionSettingsDto } from '@hatohui/models';

export type CommissionArtSettings = CommissionSettingsDto;

export function useCommissionArtSettings() {
  const queryClient = useQueryClient();
  const settingsQuery = useCommissionSettings();
  const paymentMethodsQuery = usePaymentMethods();
  const update = useUpdateCommissionSettings({
    mutation: {
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: getCommissionSettingsQueryKey(),
        }),
    },
  });

  return {
    settings: settingsQuery.data?.data,
    paymentMethods: paymentMethodsQuery.data?.data ?? [],
    isLoading: settingsQuery.isPending || paymentMethodsQuery.isPending,
    isSaving: update.isPending,
    save: update.mutateAsync,
  };
}
