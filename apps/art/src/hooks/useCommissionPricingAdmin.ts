'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@hatohui/i18n';
import { useToast } from '@hatohui/ui';
import {
  useCommissionOptionPricings,
  useCreateCommissionOptionPricing,
  useUpdateCommissionOptionPricing,
  useDeleteCommissionOptionPricing,
  getCommissionOptionPricingsQueryKey,
  getMyCommissionTypesQueryKey,
  useCommissionAddonPricings,
  useCreateCommissionAddonPricing,
  useUpdateCommissionAddonPricing,
  useDeleteCommissionAddonPricing,
  getCommissionAddonPricingsQueryKey,
} from '@hatohui/models';
import type {
  CommissionOptionPricingDto,
  CommissionAddonPricingDto,
} from '@hatohui/models';
import { invalidatePublicCommissionCache } from './invalidatePublicCommissionCache';

export function useCommissionOptionPricingAdmin(commissionTypeId: string) {
  const { t } = useTranslation('art');
  const toast = useToast();
  const queryClient = useQueryClient();
  const queryKey = getCommissionOptionPricingsQueryKey({ commissionTypeId });
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey });
    void queryClient.invalidateQueries({
      queryKey: getMyCommissionTypesQueryKey(),
    });
    invalidatePublicCommissionCache(queryClient);
  };

  const listQuery = useCommissionOptionPricings({ commissionTypeId });
  type Cache = NonNullable<typeof listQuery.data>;

  const snapshot = () => queryClient.getQueryData<Cache>(queryKey);
  const rollback = (previous: Cache | undefined) => {
    if (previous) queryClient.setQueryData(queryKey, previous);
    toast.error(t('commission.admin.pricing.saveFailed'));
  };
  const writeRows = (previous: Cache, rows: CommissionOptionPricingDto[]) => {
    queryClient.setQueryData<Cache>(queryKey, { ...previous, data: rows });
  };

  const create = useCreateCommissionOptionPricing({
    mutation: {
      onSuccess: invalidate,
      onError: () => toast.error(t('commission.admin.pricing.saveFailed')),
    },
  });

  const update = useUpdateCommissionOptionPricing<
    unknown,
    { previous: Cache | undefined }
  >({
    mutation: {
      onMutate: async ({ id, data }) => {
        await queryClient.cancelQueries({ queryKey });
        const previous = snapshot();
        if (previous) {
          writeRows(
            previous,
            previous.data.map((row) =>
              row.id === id
                ? { ...row, ...data, maxPrice: data.maxPrice ?? null }
                : row,
            ),
          );
        }
        return { previous };
      },
      onError: (_error, _variables, context) => rollback(context?.previous),
      onSettled: invalidate,
    },
  });

  const remove = useDeleteCommissionOptionPricing<
    unknown,
    { previous: Cache | undefined }
  >({
    mutation: {
      onMutate: async ({ id }) => {
        await queryClient.cancelQueries({ queryKey });
        const previous = snapshot();
        if (previous) {
          writeRows(
            previous,
            previous.data.filter((row) => row.id !== id),
          );
        }
        return { previous };
      },
      onSuccess: () => toast.success(t('commission.admin.pricing.removed')),
      onError: (_error, _variables, context) => rollback(context?.previous),
      onSettled: invalidate,
    },
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
  const { t } = useTranslation('art');
  const toast = useToast();
  const queryClient = useQueryClient();
  const queryKey = getCommissionAddonPricingsQueryKey();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey });
    invalidatePublicCommissionCache(queryClient);
  };

  const listQuery = useCommissionAddonPricings();
  type Cache = NonNullable<typeof listQuery.data>;

  const snapshot = () => queryClient.getQueryData<Cache>(queryKey);
  const rollback = (previous: Cache | undefined) => {
    if (previous) queryClient.setQueryData(queryKey, previous);
    toast.error(t('commission.admin.pricing.saveFailed'));
  };
  const writeRows = (previous: Cache, rows: CommissionAddonPricingDto[]) => {
    queryClient.setQueryData<Cache>(queryKey, { ...previous, data: rows });
  };

  const create = useCreateCommissionAddonPricing({
    mutation: {
      onSuccess: invalidate,
      onError: () => toast.error(t('commission.admin.pricing.saveFailed')),
    },
  });

  const update = useUpdateCommissionAddonPricing<
    unknown,
    { previous: Cache | undefined }
  >({
    mutation: {
      onMutate: async ({ id, data }) => {
        await queryClient.cancelQueries({ queryKey });
        const previous = snapshot();
        if (previous) {
          writeRows(
            previous,
            previous.data.map((row) =>
              row.id === id
                ? {
                    ...row,
                    ...data,
                    minPrice: data.minPrice ?? null,
                    maxPrice: data.maxPrice ?? null,
                    percent: data.percent ?? null,
                  }
                : row,
            ),
          );
        }
        return { previous };
      },
      onError: (_error, _variables, context) => rollback(context?.previous),
      onSettled: invalidate,
    },
  });

  const remove = useDeleteCommissionAddonPricing<
    unknown,
    { previous: Cache | undefined }
  >({
    mutation: {
      onMutate: async ({ id }) => {
        await queryClient.cancelQueries({ queryKey });
        const previous = snapshot();
        if (previous) {
          writeRows(
            previous,
            previous.data.filter((row) => row.id !== id),
          );
        }
        return { previous };
      },
      onSuccess: () => toast.success(t('commission.admin.pricing.removed')),
      onError: (_error, _variables, context) => rollback(context?.previous),
      onSettled: invalidate,
    },
  });

  return {
    items: listQuery.data?.data ?? [],
    isLoading: listQuery.isPending,
    create: create.mutateAsync,
    update: update.mutateAsync,
    remove: (id: string) => remove.mutateAsync({ id }),
  };
}
