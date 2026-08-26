'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { Button, Input, Label } from '@hatohui/ui';
import {
  useCommissionRushFeeAdmin,
  type RushFeeSetting,
} from '@/hooks/useCommissionRushFeeAdmin';

function RushFeeForm({
  initial,
  onSave,
}: {
  initial: RushFeeSetting | null | undefined;
  onSave: (thresholdDays: number, feeAmount: number) => void;
}) {
  const { t } = useTranslation('art');
  const [thresholdDays, setThresholdDays] = useState(
    String(initial?.thresholdDays ?? 10),
  );
  const [feeDollars, setFeeDollars] = useState(
    String((initial?.feeAmount ?? 2500) / 100),
  );

  return (
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
          onSave(Number(thresholdDays), Math.round(Number(feeDollars) * 100))
        }
      >
        {t('gallery.upload.save')}
      </Button>
    </div>
  );
}

export function CommissionRushFeeSection({ artistId }: { artistId: string }) {
  const { t } = useTranslation('art');
  const { rushFee, isLoading, update } = useCommissionRushFeeAdmin(artistId);

  return (
    <section>
      <h2 className="mb-2 font-medium">
        {t('commission.admin.pricing.rushFee')}
      </h2>
      {!isLoading && (
        <RushFeeForm
          key={rushFee ? 'loaded' : 'default'}
          initial={rushFee}
          onSave={(thresholdDays, feeAmount) =>
            void update({ data: { thresholdDays, feeAmount } })
          }
        />
      )}
    </section>
  );
}
