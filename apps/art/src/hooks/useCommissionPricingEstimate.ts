'use client';

import { useMemo } from 'react';
import {
  useCommissionPricing,
  useCommissionTypesByArtist,
} from '@hatohui/models';

function daysUntil(dateString: string): number {
  const target = new Date(`${dateString}T00:00:00`);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function useCommissionPricingEstimate(
  artistId: string | undefined,
  commissionTypeId: string | undefined,
  optionKey: string | undefined,
  addonKeys: string[],
  deadline?: string,
) {
  const typesQuery = useCommissionTypesByArtist(artistId ?? '', {
    query: { enabled: !!artistId },
  });
  const pricingQuery = useCommissionPricing(
    { artistId: artistId ?? '' },
    { query: { enabled: !!artistId } },
  );
  const pricing = pricingQuery.data?.data;
  const types = typesQuery.data?.data ?? [];

  const optionsForType = useMemo(
    () =>
      (pricing?.options ?? []).filter(
        (option) => option.commissionTypeId === commissionTypeId,
      ),
    [pricing, commissionTypeId],
  );

  // A type with exactly one option applies it directly — no picker needed,
  // so the estimate still resolves even before the client "chooses" one.
  const selectedOption =
    optionsForType.find((option) => option.key === optionKey) ??
    (optionsForType.length === 1 ? optionsForType[0] : undefined);

  const isRush = useMemo(() => {
    if (!pricing?.rushFee?.enabled || !deadline) return false;
    return daysUntil(deadline) < pricing.rushFee.thresholdDays;
  }, [pricing, deadline]);

  const estimate = useMemo(() => {
    if (!pricing || !selectedOption) return null;
    const base = selectedOption.minPrice;

    const addonsTotal = addonKeys.reduce((sum, key) => {
      const addon = pricing.addons.find((row) => row.key === key);
      if (!addon) return sum;
      if (addon.priceMode === 'PERCENTAGE') {
        return sum + Math.round((base * (addon.percent ?? 0)) / 100);
      }
      return sum + (addon.minPrice ?? 0);
    }, 0);

    const rushFee = isRush ? (pricing.rushFee?.feeAmount ?? 0) : 0;

    return base + addonsTotal + rushFee;
  }, [pricing, selectedOption, addonKeys, isRush]);

  return {
    types,
    optionsForType,
    selectedOption,
    addons: pricing?.addons ?? [],
    rushFee: pricing?.rushFee ?? null,
    currency: pricing?.currency ?? 'USD',
    isRush,
    estimate,
    isLoading: pricingQuery.isPending || typesQuery.isPending,
  };
}
