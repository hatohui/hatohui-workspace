'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hatohui/ui';
import type { CommissionOptionPricingDtoPriceMode } from '@hatohui/models';
import { useCommissionOptionPricingAdmin } from '@/hooks/useCommissionPricingAdmin';

const PRICE_MODES: CommissionOptionPricingDtoPriceMode[] = [
  'FIXED',
  'STARTING_FROM',
  'RANGE',
];

const toCents = (dollars: string) => Math.round(Number(dollars) * 100);
const toDollars = (cents: number | null | undefined) =>
  cents != null && cents > 0 ? (cents / 100).toFixed(2) : '';

export function CommissionOptionPriceLine({
  commissionTypeId,
}: {
  commissionTypeId: string;
}) {
  const { t } = useTranslation('art');
  const { items, create, update } =
    useCommissionOptionPricingAdmin(commissionTypeId);
  const option = items[0];

  const [priceMode, setPriceMode] =
    useState<CommissionOptionPricingDtoPriceMode>(option?.priceMode ?? 'FIXED');
  const [minPrice, setMinPrice] = useState(toDollars(option?.minPrice));
  const [maxPrice, setMaxPrice] = useState(toDollars(option?.maxPrice));

  const commit = (
    next: Partial<{ priceMode: string; minPrice: string; maxPrice: string }>,
  ) => {
    const mode = (next.priceMode ??
      priceMode) as CommissionOptionPricingDtoPriceMode;
    const min = next.minPrice ?? minPrice;
    const max = next.maxPrice ?? maxPrice;
    if (!min.trim()) return;
    const payload = {
      commissionTypeId,
      label: option?.label ?? 'Default',
      priceMode: mode,
      minPrice: toCents(min),
      maxPrice: mode === 'RANGE' && max.trim() ? toCents(max) : undefined,
    };
    if (option) void update({ id: option.id, data: payload });
    else void create({ data: payload });
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">
          {t('app.commissionSettings.priceLine.mode')}
        </Label>
        <Select
          value={priceMode}
          onValueChange={(value) => {
            setPriceMode(value as CommissionOptionPricingDtoPriceMode);
            commit({ priceMode: value });
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRICE_MODES.map((mode) => (
              <SelectItem key={mode} value={mode}>
                {t(`commission.admin.pricing.priceMode.${mode}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">
          {t('app.commissionSettings.priceLine.price')}
        </Label>
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          className="w-32"
          value={minPrice}
          onChange={(event) => setMinPrice(event.target.value)}
          onBlur={() => commit({})}
        />
      </div>

      {priceMode === 'RANGE' && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            {t('app.commissionSettings.priceLine.upTo')}
          </Label>
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            className="w-32"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            onBlur={() => commit({})}
          />
        </div>
      )}
    </div>
  );
}
