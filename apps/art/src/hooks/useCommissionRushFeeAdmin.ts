'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  useCommissionPricing,
  useUpdateCommissionRushFee,
  getCommissionPricingQueryKey,
} from '@hatohui/models';
import type { CommissionRushFeeSettingDto } from '@hatohui/models';

export type RushFeeSetting = CommissionRushFeeSettingDto;

export function useCommissionRushFeeAdmin(artistId: string) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: getCommissionPricingQueryKey({ artistId }),
    });

  const pricingQuery = useCommissionPricing({ artistId });
  const update = useUpdateCommissionRushFee({
    mutation: { onSuccess: invalidate },
  });

  return {
    rushFee: pricingQuery.data?.data.rushFee,
    isLoading: pricingQuery.isPending,
    isSaving: update.isPending,
    update: update.mutateAsync,
  };
}
