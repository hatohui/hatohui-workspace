'use client';

import { useTranslation } from '@hatohui/i18n';
import { useCommissionForm } from '@/hooks/useCommissionForm';
import { useCommissionContact } from '@/hooks/useCommissionContact';
import { useStaggerReveal } from '@/hooks/useStaggerReveal';
import { useCommissionValidation } from '@/hooks/useCommissionValidation';
import { CommissionDetailsPanel } from './CommissionDetailsPanel';
import { CommissionRequestPanel } from './CommissionRequestPanel';

export function CommissionForm({ artistId }: { artistId: string }) {
  const { t } = useTranslation('art');
  const form = useCommissionForm(artistId);
  const contact = useCommissionContact(form);
  const validation = useCommissionValidation(form, contact);
  const formRef = useStaggerReveal<HTMLFormElement>(':scope > *', []);

  if (form.isSubmitted) {
    return (
      <p className="mx-auto max-w-xl text-lg">{t('commission.form.success')}</p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">{t('commission.form.title')}</h1>
      </div>

      {form.isDraftRestored && (
        <p className="rounded-md bg-secondary px-3 py-2 text-sm text-muted-foreground">
          {t('commission.form.draftRestored')}
        </p>
      )}

      <form
        ref={formRef}
        className="space-y-4"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (validation.validate()) void form.submit();
        }}
      >
        <CommissionDetailsPanel
          form={form}
          artistId={artistId}
          validation={validation}
        />
        <CommissionRequestPanel
          form={form}
          contact={contact}
          validation={validation}
        />
      </form>
    </div>
  );
}
