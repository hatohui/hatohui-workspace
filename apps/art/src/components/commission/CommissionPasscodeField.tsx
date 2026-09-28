'use client';

import { useTranslation } from '@hatohui/i18n';
import { Input, Label } from '@hatohui/ui';
import { PASSCODE_MAX_LENGTH } from '@/constants/queue';
import type { useCommissionForm } from '@/hooks/useCommissionForm';
import type { CommissionValidation } from '@/hooks/useCommissionValidation';
import { CommissionFieldError } from './CommissionFieldError';

export function CommissionPasscodeField({
  form,
  validation,
}: {
  form: ReturnType<typeof useCommissionForm>;
  validation: CommissionValidation;
}) {
  const { t } = useTranslation('art');
  const error = validation.errorFor('passcode');

  return (
    <div className="space-y-1.5">
      <Label htmlFor="passcode">{t('commission.form.passcodeLabel')}</Label>
      <Input
        id="passcode"
        type="password"
        autoComplete="new-password"
        maxLength={PASSCODE_MAX_LENGTH}
        value={form.passcode}
        aria-invalid={error ? true : undefined}
        aria-describedby="passcode-error"
        onBlur={() => validation.touch('passcode')}
        onChange={(event) => form.setPasscode(event.target.value)}
      />
      <CommissionFieldError
        id="passcode-error"
        message={error}
        hint={t('commission.form.hints.passcode')}
      />
    </div>
  );
}
