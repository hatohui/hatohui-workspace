'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import type { CommissionTypePricingDto } from '@hatohui/models';
import { Button, Input } from '@hatohui/ui';

export function CommissionTypePriceRow({
  item,
  onSave,
}: {
  item: CommissionTypePricingDto;
  onSave: (basePriceCents: number) => Promise<unknown>;
}) {
  const { t } = useTranslation('art');
  const [price, setPrice] = useState(String(item.basePriceCents / 100));

  return (
    <li className="flex items-center justify-between gap-2 rounded-md bg-card p-2 text-sm">
      <span>{t(`commission.type.${item.type}.label`)}</span>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          className="w-24"
        />
        <Button
          size="sm"
          onClick={() => void onSave(Math.round(Number(price) * 100))}
        >
          {t('gallery.upload.save')}
        </Button>
      </div>
    </li>
  );
}
