'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { Button, Input } from '@hatohui/ui';
import { useCommissionOptionPricingAdmin } from '@/hooks/useCommissionPricingAdmin';

export function CommissionOptionPricingSection() {
  const { t } = useTranslation('art');
  const pricing = useCommissionOptionPricingAdmin();
  const [key, setKey] = useState('');
  const [modifier, setModifier] = useState('');

  return (
    <section>
      <h2 className="mb-2 font-medium">{t('commission.form.optionLabel')}</h2>
      <ul className="space-y-1">
        {pricing.items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-md bg-card p-2 text-sm"
          >
            <span>
              {t(`commission.option.${item.key}.label`, {
                defaultValue: item.key,
              })}{' '}
              — {item.modifierPercent}%
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
          placeholder="%"
          value={modifier}
          onChange={(event) => setModifier(event.target.value)}
        />
        <Button
          disabled={!key || !modifier}
          onClick={() => {
            void pricing
              .create({ data: { key, modifierPercent: Number(modifier) } })
              .then(() => {
                setKey('');
                setModifier('');
              });
          }}
        >
          {t('gallery.upload.save')}
        </Button>
      </div>
    </section>
  );
}
