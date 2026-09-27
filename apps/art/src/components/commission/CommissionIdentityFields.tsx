'use client';

import { UserCircle } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Input, Label } from '@hatohui/ui';
import type { useCommissionForm } from '@/hooks/useCommissionForm';
import type { CommissionValidation } from '@/hooks/useCommissionValidation';
import { CommissionFieldError } from './CommissionFieldError';
import { ConfirmedIdentityCard } from './ConfirmedIdentityCard';
import { CommissionEmailField } from './CommissionEmailField';

export function CommissionIdentityFields({
  form,
  validation,
}: {
  form: ReturnType<typeof useCommissionForm>;
  validation: CommissionValidation;
}) {
  const { t } = useTranslation('art');
  const nameError = validation.errorFor('clientName');
  const matched = form.state.matchedIdentity;

  if (form.signedInName) {
    return (
      <p className="flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm">
        <UserCircle className="size-4 shrink-0 text-muted-foreground" />
        {t('commission.form.submittingAs', { name: form.signedInName })}
      </p>
    );
  }

  if (!form.needsIdentity) return null;

  if (matched) {
    return (
      <>
        <ConfirmedIdentityCard identity={matched} onUndo={form.clearIdentity} />
        {!matched.hasEmail && (
          <CommissionEmailField
            form={form}
            validation={validation}
            note={t('commission.form.emailMissing')}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="clientName" required>
          {t('commission.form.clientNameLabel')}
        </Label>
        <Input
          id="clientName"
          required
          value={form.state.clientName}
          placeholder={t('commission.form.placeholders.name')}
          aria-invalid={nameError ? true : undefined}
          aria-describedby="clientName-error"
          onBlur={() => validation.touch('clientName')}
          onChange={(event) => form.update('clientName', event.target.value)}
        />
        <CommissionFieldError
          id="clientName-error"
          message={nameError}
          hint={t('commission.form.hints.name')}
        />
      </div>

      <CommissionEmailField form={form} validation={validation} />
    </>
  );
}
