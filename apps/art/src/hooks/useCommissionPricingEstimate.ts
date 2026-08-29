'use client';

import { useMemo } from 'react';
import {
  useCommissionPricing,
  useCommissionTypesByArtist,
} from '@hatohui/models';
import type {
  CommissionAddonPricingDto,
  CommissionOptionPricingDto,
} from '@hatohui/models';
import { COMMISSION_PRICING_STALE_MS } from '@/constants/commission';

function daysUntil(dateString: string): number {
  const target = new Date(`${dateString}T00:00:00`);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

type Bounds = { low: number; high: number | null };

function optionBounds(option: CommissionOptionPricingDto): Bounds {
  if (option.priceMode === 'RANGE')
    return { low: option.minPrice, high: option.maxPrice ?? option.minPrice };
  if (option.priceMode === 'STARTING_FROM')
    return { low: option.minPrice, high: null };
  return { low: option.minPrice, high: option.minPrice };
}

function addonBounds(addon: CommissionAddonPricingDto, base: Bounds): Bounds {
  if (addon.priceMode === 'PERCENTAGE') {
    const percent = addon.percent ?? 0;
    return {
      low: Math.round((base.low * percent) / 100),
      high: base.high == null ? null : Math.round((base.high * percent) / 100),
    };
  }
  const min = addon.minPrice ?? 0;
  if (addon.priceMode === 'RANGE')
    return { low: min, high: addon.maxPrice ?? min };
  if (addon.priceMode === 'STARTING_FROM') return { low: min, high: null };
  return { low: min, high: min };
}

export function useCommissionPricingEstimate(
  artistId: string | undefined,
  commissionTypeId: string | undefined,
  optionKey: string | undefined,
  addonKeys: string[],
  deadline?: string,
) {
  const typesQuery = useCommissionTypesByArtist(artistId ?? '', {
    query: { enabled: !!artistId, staleTime: COMMISSION_PRICING_STALE_MS },
  });
  const pricingQuery = useCommissionPricing(
    { artistId: artistId ?? '' },
    { query: { enabled: !!artistId, staleTime: COMMISSION_PRICING_STALE_MS } },
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

  // A type with exactly one option applies it directly - no picker needed,
  // so the estimate still resolves even before the client "chooses" one.
  const selectedOption =
    optionsForType.find((option) => option.key === optionKey) ??
    (optionsForType.length === 1 ? optionsForType[0] : undefined);

  const isRush = useMemo(() => {
    if (!pricing?.rushFee?.enabled || !deadline) return false;
    return daysUntil(deadline) < pricing.rushFee.thresholdDays;
  }, [pricing, deadline]);

  const bounds = useMemo<Bounds | null>(() => {
    if (!pricing || !selectedOption) return null;
    const base = optionBounds(selectedOption);
    let low = base.low;
    let high = base.high;
    for (const key of addonKeys) {
      const addon = pricing.addons.find((row) => row.key === key);
      if (!addon) continue;
      const add = addonBounds(addon, base);
      low += add.low;
      high = high == null || add.high == null ? null : high + add.high;
    }
    const rushFee = isRush ? (pricing.rushFee?.feeAmount ?? 0) : 0;
    return {
      low: low + rushFee,
      high: high == null ? null : high + rushFee,
    };
  }, [pricing, selectedOption, addonKeys, isRush]);

  const estimateMode: 'exact' | 'from' | 'range' | null = bounds
    ? bounds.high == null
      ? 'from'
      : bounds.high > bounds.low
        ? 'range'
        : 'exact'
    : null;

  return {
    types,
    optionsForType,
    selectedOption,
    addons: pricing?.addons ?? [],
    rushFee: pricing?.rushFee ?? null,
    currency: pricing?.currency ?? 'USD',
    isRush,
    estimate: bounds?.low ?? null,
    estimateHigh: bounds?.high ?? null,
    estimateMode,
    isLoading: pricingQuery.isPending || typesQuery.isPending,
  };
}
