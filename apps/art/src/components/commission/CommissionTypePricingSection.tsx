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
import { useCommissionTypePricingAdmin } from '@/hooks/useCommissionPricingAdmin';
import { useCommissionTypesAdmin } from '@/hooks/useCommissionTypesAdmin';
import { CommissionTypePriceRow } from './CommissionTypePriceRow';

export function CommissionTypePricingSection() {
  const { t } = useTranslation('art');
  const pricing = useCommissionTypePricingAdmin();
  const types = useCommissionTypesAdmin();
  const [newTypeId, setNewTypeId] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const pricedTypeIds = new Set(
    pricing.items.map((item) => item.commissionTypeId),
  );
  const unpricedTypes = types.items.filter(
    (type) => !pricedTypeIds.has(type.id),
  );

  return (
    <section>
      <h2 className="mb-2 font-medium">
        {t('commission.form.commissionTypeLabel')}
      </h2>
      <ul className="space-y-1">
        {pricing.items.map((item) => (
          <CommissionTypePriceRow
            key={item.id}
            item={item}
            onSave={(basePriceCents) =>
              pricing.update({
                id: item.id,
                data: {
                  commissionTypeId: item.commissionTypeId,
                  basePriceCents,
                },
              })
            }
          />
        ))}
      </ul>
      {unpricedTypes.length > 0 && (
        <div className="mt-2 flex gap-2">
          <Select value={newTypeId} onValueChange={setNewTypeId}>
            <SelectTrigger>
              <SelectValue
                placeholder={t('commission.form.commissionTypePlaceholder')}
              />
            </SelectTrigger>
            <SelectContent>
              {unpricedTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {t(`commission.type.${type.key}.label`, {
                    defaultValue: type.key,
                  })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="$"
            value={newPrice}
            onChange={(event) => setNewPrice(event.target.value)}
          />
          <Button
            disabled={!newTypeId || !newPrice}
            onClick={() => {
              void pricing
                .create({
                  data: {
                    commissionTypeId: newTypeId,
                    basePriceCents: Math.round(Number(newPrice) * 100),
                  },
                })
                .then(() => {
                  setNewTypeId('');
                  setNewPrice('');
                });
            }}
          >
            {t('gallery.upload.save')}
          </Button>
        </div>
      )}
    </section>
  );
}
