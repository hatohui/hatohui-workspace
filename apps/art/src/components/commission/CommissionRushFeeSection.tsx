'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { Button, Input, Label, Spinner, Switch, useToast } from '@hatohui/ui';
import {
  useCommissionRushFeeAdmin,
  type RushFeeSetting,
} from '@/hooks/useCommissionRushFeeAdmin';

function RushFeeForm({
  initial,
  saving,
  onSave,
}: {
  initial: RushFeeSetting | null | undefined;
  saving: boolean;
  onSave: (
    enabled: boolean,
    thresholdDays: number,
    feeAmount: number,
  ) => Promise<unknown>;
}) {
  const { t } = useTranslation('art');
  const toast = useToast();
  const [enabled, setEnabled] = useState(initial?.enabled ?? false);
  const [thresholdDays, setThresholdDays] = useState(
    String(initial?.thresholdDays ?? 10),
  );
  const [feeDollars, setFeeDollars] = useState(
    String((initial?.feeAmount ?? 2500) / 100),
  );

  const runSave = async (nextEnabled: boolean, announce: boolean) => {
    try {
      await onSave(
        nextEnabled,
        Number(thresholdDays),
        Math.round(Number(feeDollars) * 100),
      );
      if (announce) toast.success(t('commission.admin.pricing.saved'));
    } catch {
      toast.error(t('commission.admin.pricing.saveFailed'));
    }
  };

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex items-center gap-2">
        <Switch
          id="rush-fee-enabled"
          checked={enabled}
          onCheckedChange={(checked) => {
            setEnabled(checked);
            void runSave(checked, false);
          }}
        />
        <Label htmlFor="rush-fee-enabled">
          {t('commission.admin.pricing.rushFeeEnabled')}
        </Label>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="rush-days">
          {t('commission.admin.pricing.rushFeeDays')}
        </Label>
        <Input
          id="rush-days"
          type="number"
          inputMode="numeric"
          min={1}
          className="w-32"
          disabled={!enabled}
          value={thresholdDays}
          onChange={(event) => setThresholdDays(event.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="rush-amount">
          {t('commission.admin.pricing.rushFeeAmount')}
        </Label>
        <Input
          id="rush-amount"
          type="number"
          inputMode="decimal"
          min={0}
          className="w-32"
          disabled={!enabled}
          value={feeDollars}
          onChange={(event) => setFeeDollars(event.target.value)}
        />
      </div>
      <Button
        disabled={!enabled || saving}
        onClick={() => void runSave(enabled, true)}
      >
        {saving && <Spinner className="size-4" />}
        {t('gallery.upload.save')}
      </Button>
    </div>
  );
}

export function CommissionRushFeeSection({ artistId }: { artistId: string }) {
  const { t } = useTranslation('art');
  const { rushFee, isLoading, isSaving, update } =
    useCommissionRushFeeAdmin(artistId);

  return (
    <section className="space-y-3">
      <div className="max-w-2xl space-y-1">
        <h2 className="font-medium">{t('app.commissionSettings.rushFee')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('app.commissionSettings.rushFeeHint')}
        </p>
      </div>
      {!isLoading && (
        <RushFeeForm
          key={rushFee ? 'loaded' : 'default'}
          initial={rushFee}
          saving={isSaving}
          onSave={(enabled, thresholdDays, feeAmount) =>
            update({ data: { enabled, thresholdDays, feeAmount } })
          }
        />
      )}
    </section>
  );
}
