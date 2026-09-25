import type {
  CommissionAddonPricingDto,
  CommissionOptionPricingDto,
  CommissionPricingDto,
} from '@/modules/commission-pricing/dto/commission-pricing.dto';

export interface EstimateSelection {
  commissionTypeId?: string;
  optionKey?: string;
  addonKeys?: string[];
  deadline?: string;
}

export interface Estimate {
  low: number;
  high: number | null;
}

const DAY_MS = 86_400_000;

function optionBounds(option: CommissionOptionPricingDto): Estimate {
  if (option.priceMode === 'RANGE') {
    return { low: option.minPrice, high: option.maxPrice ?? option.minPrice };
  }
  if (option.priceMode === 'STARTING_FROM') {
    return { low: option.minPrice, high: null };
  }
  return { low: option.minPrice, high: option.minPrice };
}

function addonBounds(
  addon: CommissionAddonPricingDto,
  base: Estimate,
): Estimate {
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

function isRush(
  pricing: CommissionPricingDto,
  deadline: string | undefined,
  now: Date,
): boolean {
  if (!pricing.rushFee?.enabled || !deadline) return false;
  const days = Math.round(
    (new Date(deadline).getTime() - now.getTime()) / DAY_MS,
  );
  return days < pricing.rushFee.thresholdDays;
}

/// Price range the request form shows the client.
export function estimateCommission(
  pricing: CommissionPricingDto,
  selection: EstimateSelection,
  now = new Date(),
): Estimate | null {
  const options = pricing.options.filter(
    (option) => option.commissionTypeId === selection.commissionTypeId,
  );
  const option =
    options.find((candidate) => candidate.key === selection.optionKey) ??
    (options.length === 1 ? options[0] : undefined);
  if (!option) return null;

  const base = optionBounds(option);
  let { low, high } = base;
  for (const key of selection.addonKeys ?? []) {
    const addon = pricing.addons.find((row) => row.key === key);
    if (!addon) continue;
    const add = addonBounds(addon, base);
    low += add.low;
    high = high == null || add.high == null ? null : high + add.high;
  }

  const rushFee = isRush(pricing, selection.deadline, now)
    ? (pricing.rushFee?.feeAmount ?? 0)
    : 0;
  return { low: low + rushFee, high: high == null ? null : high + rushFee };
}
