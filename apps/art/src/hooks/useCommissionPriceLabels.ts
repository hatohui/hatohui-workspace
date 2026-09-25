'use client';

import { useTranslation } from '@hatohui/i18n';
import type {
  CommissionAddonPricingDto,
  CommissionOptionPricingDto,
} from '@hatohui/models';
import type { useCommissionPricingEstimate } from './useCommissionPricingEstimate';

type Pricing = ReturnType<typeof useCommissionPricingEstimate>;
type CommissionType = Pricing['types'][number];

export interface PriceTableRow {
  id: string;
  label: string;
  price: string;
  options: { key: string; label: string; price: string }[];
}

export function useCommissionPriceLabels(pricing: Pricing) {
  const { t, i18n } = useTranslation('art');

  const money = (cents: number) => {
    const digits = cents % 100 === 0 ? 0 : 2;
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: pricing.currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(cents / 100);
  };

  const from = (cents: number) =>
    t('commission.form.estimateFrom', { price: money(cents) });

  const range = (low: number, high: number | null | undefined) =>
    high != null
      ? t('commission.form.estimateRange', {
          low: money(low),
          high: money(high),
        })
      : from(low);

  const optionPrice = (option: CommissionOptionPricingDto) => {
    if (option.priceMode === 'RANGE')
      return range(option.minPrice, option.maxPrice);
    if (option.priceMode === 'STARTING_FROM') return from(option.minPrice);
    return money(option.minPrice);
  };

  const addonPrice = (addon: CommissionAddonPricingDto) => {
    const min = addon.minPrice ?? 0;
    if (addon.priceMode === 'PERCENTAGE') return `${addon.percent ?? 0}%`;
    if (addon.priceMode === 'RANGE') return range(min, addon.maxPrice);
    if (addon.priceMode === 'STARTING_FROM') return from(min);
    return money(min);
  };

  const optionsOf = (typeId: string) =>
    pricing.allOptions.filter((option) => option.commissionTypeId === typeId);

  const typePrice = (typeId: string): string | null => {
    const options = optionsOf(typeId);
    if (options.length === 0) return null;
    if (options.length === 1) return optionPrice(options[0]);
    return from(Math.min(...options.map((option) => option.minPrice)));
  };

  const typeName = (type: CommissionType) =>
    t(`commission.type.${type.key}.label`, { defaultValue: type.label });

  const withPrice = (label: string, price: string | null) =>
    price ? `${label} (${price})` : label;

  const rows: PriceTableRow[] = pricing.types.flatMap((type) => {
    const price = typePrice(type.id);
    if (!price) return [];
    const options = optionsOf(type.id);
    return [
      {
        id: type.id,
        label: typeName(type),
        price,
        options:
          options.length > 1
            ? options.map((option) => ({
                key: option.key,
                label: option.label,
                price: optionPrice(option),
              }))
            : [],
      },
    ];
  });

  return {
    money,
    rows,
    typeLabel: (type: CommissionType) =>
      withPrice(typeName(type), typePrice(type.id)),
    optionLabel: (option: CommissionOptionPricingDto) =>
      withPrice(option.label, optionPrice(option)),
    addonLabel: (addon: CommissionAddonPricingDto) =>
      withPrice(addon.label, addonPrice(addon)),
  };
}
