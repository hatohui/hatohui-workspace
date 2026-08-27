'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { Button, Input, Label, Switch } from '@hatohui/ui';
import {
  useCommissionRushFeeAdmin,
  type RushFeeSetting,
} from '@/hooks/useCommissionRushFeeAdmin';

function RushFeeForm({
  initial,
  onSave,
}: {
  initial: RushFeeSetting | null | undefined;
  onSave: (enabled: boolean, thresholdDays: number, feeAmount: number) => void;
}) {
  const { t } = useTranslation('art');
  const [enabled, setEnabled] = useState(initial?.enabled ?? false);
  const [thresholdDays, setThresholdDays] = useState(
    String(initial?.thresholdDays ?? 10),
  );
  const [feeDollars, setFeeDollars] = useState(
    String((initial?.feeAmount ?? 2500) / 100),
  );

  return (
    <div className="flex items-end gap-3">
      <div className="flex items-center gap-2">
        <Switch
          checked={enabled}
          onCheckedChange={(checked) => {
            setEnabled(checked);
            onSave(
              checked,
              Number(thresholdDays),
              Math.round(Number(feeDollars) * 100),
            );
          }}
        />
        <Label>{t('commission.admin.pricing.rushFeeEnabled')}</Label>
      </div>
      <div>
        <Label htmlFor="rush-days">
          {t('commission.admin.pricing.rushFeeDays')}
        </Label>
        <Input
          id="rush-days"
          type="number"
          disabled={!enabled}
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
          disabled={!enabled}
          value={feeDollars}
          onChange={(event) => setFeeDollars(event.target.value)}
        />
      </div>
      <Button
        disabled={!enabled}
        onClick={() =>
          onSave(
            enabled,
            Number(thresholdDays),
            Math.round(Number(feeDollars) * 100),
          )
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
          onSave={(enabled, thresholdDays, feeAmount) =>
            void update({ data: { enabled, thresholdDays, feeAmount } })
          }
        />
      )}
    </section>
  );
}
