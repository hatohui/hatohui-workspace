'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { Button, Input } from '@hatohui/ui';
import { useCommissionAddonPricingAdmin } from '@/hooks/useCommissionPricingAdmin';

export function CommissionAddonPricingSection() {
  const { t } = useTranslation('art');
  const pricing = useCommissionAddonPricingAdmin();
  const [key, setKey] = useState('');
  const [minPrice, setMinPrice] = useState('');

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
              {t(`commission.addon.${item.key}.label`, {
                defaultValue: item.key,
              })}{' '}
              — ${(item.minPriceCents / 100).toFixed(0)}+
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
      <div className="mt-2 flex gap-2">
        <Input
          placeholder="KEY"
          value={key}
          onChange={(event) => setKey(event.target.value)}
        />
        <Input
          type="number"
          placeholder="$+"
          value={minPrice}
          onChange={(event) => setMinPrice(event.target.value)}
        />
        <Button
          disabled={!key || !minPrice}
          onClick={() => {
            void pricing
              .create({
                data: {
                  key,
                  minPriceCents: Math.round(Number(minPrice) * 100),
                },
              })
              .then(() => {
                setKey('');
                setMinPrice('');
              });
          }}
        >
          {t('gallery.upload.save')}
        </Button>
      </div>
    </section>
  );
}
