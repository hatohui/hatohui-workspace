'use client';

import { useTranslation } from '@hatohui/i18n';
import { Input, Label } from '@hatohui/ui';
import { EMAIL_INPUT_PATTERN } from '@/constants/commission';
import type { useCommissionForm } from '@/hooks/useCommissionForm';
import type { CommissionValidation } from '@/hooks/useCommissionValidation';
import { CommissionFieldError } from './CommissionFieldError';

export function CommissionEmailField({
  form,
  validation,
  note,
}: {
  form: ReturnType<typeof useCommissionForm>;
  validation: CommissionValidation;
  note?: string;
}) {
  const { t } = useTranslation('art');
  const error = validation.errorFor('clientEmail');

  return (
    <div className="space-y-1.5">
      <Label htmlFor="clientEmail" required>
        {t('commission.form.clientEmailLabel')}
      </Label>
      <Input
        id="clientEmail"
        type="email"
        required
        pattern={EMAIL_INPUT_PATTERN}
        title={t('commission.form.invalidEmail')}
        value={form.state.clientEmail}
        placeholder={t('commission.form.placeholders.email')}
        aria-invalid={error ? true : undefined}
        aria-describedby="clientEmail-error"
        onBlur={() => validation.touch('clientEmail')}
        onChange={(event) => form.update('clientEmail', event.target.value)}
      />
      <CommissionFieldError
        id="clientEmail-error"
        message={error}
        hint={note ?? t('commission.form.hints.email')}
      />
    </div>
  );
}
