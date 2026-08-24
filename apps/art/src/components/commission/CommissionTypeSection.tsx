'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { Button, Input } from '@hatohui/ui';
import { useCommissionTypesAdmin } from '@/hooks/useCommissionTypesAdmin';

export function CommissionTypeSection() {
  const { t } = useTranslation('art');
  const types = useCommissionTypesAdmin();
  const [key, setKey] = useState('');

  return (
    <section>
      <h2 className="mb-2 font-medium">
        {t('commission.form.commissionTypeLabel')}
      </h2>
      <ul className="space-y-1">
        {types.items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-md bg-card p-2 text-sm"
          >
            <span>
              {t(`commission.type.${item.key}.label`, {
                defaultValue: item.key,
              })}{' '}
              {!item.active && `(${t('commission.admin.inactive')})`}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void types.remove(item.id)}
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
        <Button
          disabled={!key}
          onClick={() => {
            void types.create({ data: { key } }).then(() => setKey(''));
          }}
        >
          {t('gallery.upload.save')}
        </Button>
      </div>
    </section>
  );
}
