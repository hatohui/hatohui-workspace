'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  useCommissionSettings,
  useUpdateCommissionSettings,
  getCommissionSettingsQueryKey,
} from '@hatohui/models';
import type { CommissionSettingsDto } from '@hatohui/models';
import { invalidatePublicCommissionCache } from './invalidatePublicCommissionCache';

export type CommissionArtSettings = CommissionSettingsDto;

export function useCommissionArtSettings() {
  const queryClient = useQueryClient();
  const settingsQuery = useCommissionSettings();
  const update = useUpdateCommissionSettings({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: getCommissionSettingsQueryKey(),
        });
        invalidatePublicCommissionCache(queryClient);
      },
    },
  });

  return {
    settings: settingsQuery.data?.data,
    isLoading: settingsQuery.isPending,
    isSaving: update.isPending,
    save: update.mutateAsync,
  };
}
