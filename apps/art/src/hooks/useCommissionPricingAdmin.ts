'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  useCommissionOptionPricings,
  useCreateCommissionOptionPricing,
  useUpdateCommissionOptionPricing,
  useDeleteCommissionOptionPricing,
  getCommissionOptionPricingsQueryKey,
  useCommissionAddonPricings,
  useCreateCommissionAddonPricing,
  useUpdateCommissionAddonPricing,
  useDeleteCommissionAddonPricing,
  getCommissionAddonPricingsQueryKey,
} from '@hatohui/models';

export function useCommissionOptionPricingAdmin(commissionTypeId: string) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: getCommissionOptionPricingsQueryKey({ commissionTypeId }),
    });

  const listQuery = useCommissionOptionPricings({ commissionTypeId });
  const create = useCreateCommissionOptionPricing({
    mutation: { onSuccess: invalidate },
  });
  const update = useUpdateCommissionOptionPricing({
    mutation: { onSuccess: invalidate },
  });
  const remove = useDeleteCommissionOptionPricing({
    mutation: { onSuccess: invalidate },
  });

  return {
    items: listQuery.data?.data ?? [],
    isLoading: listQuery.isPending,
    create: create.mutateAsync,
    update: update.mutateAsync,
    remove: (id: string) => remove.mutateAsync({ id }),
  };
}

export function useCommissionAddonPricingAdmin() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: getCommissionAddonPricingsQueryKey(),
    });

  const listQuery = useCommissionAddonPricings();
  const create = useCreateCommissionAddonPricing({
    mutation: { onSuccess: invalidate },
  });
  const update = useUpdateCommissionAddonPricing({
    mutation: { onSuccess: invalidate },
  });
  const remove = useDeleteCommissionAddonPricing({
    mutation: { onSuccess: invalidate },
  });

  return {
    items: listQuery.data?.data ?? [],
    isLoading: listQuery.isPending,
    create: create.mutateAsync,
    update: update.mutateAsync,
    remove: (id: string) => remove.mutateAsync({ id }),
  };
}
