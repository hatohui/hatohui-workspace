'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  useCommissionSettings,
  useUpdateCommissionSettings,
  getCommissionSettingsQueryKey,
} from '@hatohui/models';
import type { CommissionSettingsDto } from '@hatohui/models';

export type CommissionArtSettings = CommissionSettingsDto;

export function useCommissionArtSettings() {
  const queryClient = useQueryClient();
  const settingsQuery = useCommissionSettings();
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
    isLoading: settingsQuery.isPending,
    isSaving: update.isPending,
    save: update.mutateAsync,
  };
}
