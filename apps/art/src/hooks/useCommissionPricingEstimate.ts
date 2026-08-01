'use client';

import { useMemo } from 'react';
import { useCommissionPricing } from '@hatohui/models';

function daysUntil(dateString: string): number {
  const target = new Date(`${dateString}T00:00:00`);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function useCommissionPricingEstimate(
  commissionType: string | undefined,
  optionKey: string | undefined,
  addonKeys: string[],
  deadline?: string,
) {
  const pricingQuery = useCommissionPricing();
  const pricing = pricingQuery.data?.data;

  const isRush = useMemo(() => {
    if (!pricing || !deadline) return false;
    return daysUntil(deadline) < pricing.rushFee.thresholdDays;
  }, [pricing, deadline]);

  const estimateCents = useMemo(() => {
    if (!pricing || !commissionType) return null;

    const type = pricing.types.find((row) => row.type === commissionType);
    if (!type) return null;

    const option = pricing.options.find((row) => row.key === optionKey);
    const modifier = option ? 1 + option.modifierPercent / 100 : 1;
    const base = Math.round(type.basePriceCents * modifier);

    const addonsMin = addonKeys.reduce((sum, key) => {
      const addon = pricing.addons.find((row) => row.key === key);
      return sum + (addon?.minPriceCents ?? 0);
    }, 0);

    const rushFee = isRush ? pricing.rushFee.feeCents : 0;

    return base + addonsMin + rushFee;
  }, [pricing, commissionType, optionKey, addonKeys, isRush]);

  return {
    types: pricing?.types ?? [],
    options: pricing?.options ?? [],
    addons: pricing?.addons ?? [],
    rushFee: pricing?.rushFee,
    isRush,
    estimateCents,
    isLoading: pricingQuery.isPending,
  };
}
