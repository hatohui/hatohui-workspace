'use client';

import { useTranslation } from '@hatohui/i18n';
import { Label } from '@hatohui/ui';
import type { useCommissionForm } from '@/hooks/useCommissionForm';
import type { CommissionValidation } from '@/hooks/useCommissionValidation';
import { useCommissionPriceLabels } from '@/hooks/useCommissionPriceLabels';
import { DateField } from '@/components/shared/DateField';
import { InfoTooltip } from '@/components/shared/InfoTooltip';
import { CommissionFieldError } from './CommissionFieldError';

export function CommissionDeadlineField({
  form,
  validation,
}: {
  form: ReturnType<typeof useCommissionForm>;
  validation: CommissionValidation;
}) {
  const { t } = useTranslation('art');
  const error = validation.errorFor('deadline');
  const { money } = useCommissionPriceLabels(form.pricing);
  const { rushFee, isRush } = form.pricing;
  const rush = rushFee?.enabled
    ? { amount: money(rushFee.feeAmount), days: rushFee.thresholdDays }
    : null;

  return (
    <div className="space-y-1.5">
      <div className="flex h-4 items-center gap-1.5">
        <Label htmlFor="deadline">{t('commission.form.deadlineLabel')}</Label>
        {rush && (
          <InfoTooltip content={t('commission.form.rushFeeHint', rush)} />
        )}
      </div>
      <DateField
        id="deadline"
        value={form.state.deadline}
        minDate={form.earliestDeadline}
        invalid={Boolean(error)}
        onChange={(value) => {
          form.update('deadline', value);
          validation.touch('deadline');
        }}
      />
      {error ? (
        <CommissionFieldError id="deadline-error" message={error} />
      ) : rush && isRush ? (
        <p className="text-xs text-primary">
          {t('commission.form.rushFeeApplied', rush)}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          {t('commission.form.deadlineHint')}
        </p>
      )}
    </div>
  );
}
