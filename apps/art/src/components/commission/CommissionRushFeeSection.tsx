'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { Button, Input, Label } from '@hatohui/ui';
import { useCommissionRushFeeAdmin } from '@/hooks/useCommissionRushFeeAdmin';

export function CommissionRushFeeSection() {
  const { t } = useTranslation('art');
  const { rushFee, update } = useCommissionRushFeeAdmin();
  const [thresholdDays, setThresholdDays] = useState('10');
  const [feeDollars, setFeeDollars] = useState('25');

  useEffect(() => {
    if (!rushFee) return;
    setThresholdDays(String(rushFee.thresholdDays));
    setFeeDollars(String(rushFee.feeCents / 100));
  }, [rushFee]);

  return (
    <section>
      <h2 className="mb-2 font-medium">
        {t('commission.admin.pricing.rushFee')}
      </h2>
      <div className="flex items-end gap-2">
        <div>
          <Label htmlFor="rush-days">
            {t('commission.admin.pricing.rushFeeDays')}
          </Label>
          <Input
            id="rush-days"
            type="number"
            value={thresholdDays}
            onChange={(event) => setThresholdDays(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="rush-amount">
            {t('commission.admin.pricing.rushFeeAmount')}
          </Label>
          <Input
            id="rush-amount"
            type="number"
            value={feeDollars}
            onChange={(event) => setFeeDollars(event.target.value)}
          />
        </div>
        <Button
          onClick={() =>
            void update({
              data: {
                thresholdDays: Number(thresholdDays),
                feeCents: Math.round(Number(feeDollars) * 100),
              },
            })
          }
        >
          {t('gallery.upload.save')}
        </Button>
      </div>
    </section>
  );
}
