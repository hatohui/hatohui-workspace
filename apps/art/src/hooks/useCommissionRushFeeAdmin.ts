'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  useCommissionPricing,
  useUpdateCommissionRushFee,
  getCommissionPricingQueryKey,
} from '@hatohui/models';

export function useCommissionRushFeeAdmin() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getCommissionPricingQueryKey() });

  const pricingQuery = useCommissionPricing();
  const update = useUpdateCommissionRushFee({
    mutation: { onSuccess: invalidate },
  });

  return {
    rushFee: pricingQuery.data?.data.rushFee,
    isLoading: pricingQuery.isPending,
    update: update.mutateAsync,
  };
}
