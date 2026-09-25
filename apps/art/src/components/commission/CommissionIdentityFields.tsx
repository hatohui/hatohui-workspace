'use client';

import { UserCircle } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Input, Label } from '@hatohui/ui';
import { EMAIL_INPUT_PATTERN } from '@/constants/commission';
import type { useCommissionForm } from '@/hooks/useCommissionForm';

export function CommissionIdentityFields({
  form,
}: {
  form: ReturnType<typeof useCommissionForm>;
}) {
  const { t } = useTranslation('art');

  if (form.signedInName) {
    return (
      <p className="flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm">
        <UserCircle className="size-4 shrink-0 text-muted-foreground" />
        {t('commission.form.submittingAs', { name: form.signedInName })}
      </p>
    );
  }

  if (!form.needsIdentity) return null;

  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="clientName">
          {t('commission.form.clientNameLabel')}
        </Label>
        <Input
          id="clientName"
          required
          value={form.state.clientName}
          onChange={(event) => form.update('clientName', event.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="clientEmail">
          {t('commission.form.clientEmailLabel')}
        </Label>
        <Input
          id="clientEmail"
          type="email"
          required
          pattern={EMAIL_INPUT_PATTERN}
          title={t('commission.form.invalidEmail')}
          value={form.state.clientEmail}
          onChange={(event) => form.update('clientEmail', event.target.value)}
        />
      </div>
    </>
  );
}
