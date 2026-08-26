'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hatohui/ui';
import { CommissionAddonPricingDtoPriceMode as PriceMode } from '@hatohui/models';
import { useCommissionAddonPricingAdmin } from '@/hooks/useCommissionPricingAdmin';

const PRICE_MODES = [PriceMode.STARTING_FROM, PriceMode.FIXED, PriceMode.RANGE];

function formatAddonPrice(
  priceMode: PriceMode,
  minPrice: number,
  maxPrice: number | null,
): string {
  const min = (minPrice / 100).toFixed(0);
  if (priceMode === PriceMode.FIXED) return `$${min}`;
  if (priceMode === PriceMode.RANGE && maxPrice != null) {
    return `$${min}–$${(maxPrice / 100).toFixed(0)}`;
  }
  return `$${min}+`;
}

export function CommissionAddonPricingSection() {
  const { t } = useTranslation('art');
  const pricing = useCommissionAddonPricingAdmin();
  const [key, setKey] = useState('');
  const [label, setLabel] = useState('');
  const [priceMode, setPriceMode] = useState<PriceMode>(
    PriceMode.STARTING_FROM,
  );
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const canSave =
    key && label && minPrice && (priceMode !== PriceMode.RANGE || maxPrice);

  return (
    <section>
      <h2 className="mb-2 font-medium">{t('commission.form.addonsLabel')}</h2>
      <ul className="space-y-1">
        {pricing.items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-md bg-card p-2 text-sm"
          >
            <span>
              {item.label} —{' '}
              {formatAddonPrice(item.priceMode, item.minPrice, item.maxPrice)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void pricing.remove(item.id)}
            >
              {t('gallery.card.delete')}
            </Button>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Input
          placeholder="KEY"
          value={key}
          onChange={(event) => setKey(event.target.value)}
        />
        <Input
          placeholder={t('commission.form.addonsLabel')}
          value={label}
          onChange={(event) => setLabel(event.target.value)}
        />
        <Select
          value={priceMode}
          onValueChange={(value) => setPriceMode(value as PriceMode)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRICE_MODES.map((mode) => (
              <SelectItem key={mode} value={mode}>
                {t(`commission.admin.pricing.priceMode.${mode}`, {
                  defaultValue: mode,
                })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder={priceMode === PriceMode.FIXED ? '$' : '$ from'}
          value={minPrice}
          onChange={(event) => setMinPrice(event.target.value)}
        />
        {priceMode === PriceMode.RANGE && (
          <Input
            type="number"
            placeholder="$ to"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
          />
        )}
        <Button
          disabled={!canSave}
          onClick={() => {
            void pricing
              .create({
                data: {
                  key,
                  label,
                  priceMode,
                  minPrice: Math.round(Number(minPrice) * 100),
                  maxPrice:
                    priceMode === PriceMode.RANGE
                      ? Math.round(Number(maxPrice) * 100)
                      : undefined,
                },
              })
              .then(() => {
                setKey('');
                setLabel('');
                setMinPrice('');
                setMaxPrice('');
                setPriceMode(PriceMode.STARTING_FROM);
              });
          }}
        >
          {t('gallery.upload.save')}
        </Button>
      </div>
    </section>
  );
}
