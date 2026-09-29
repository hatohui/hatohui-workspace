'use client';

import type { useCommissionForm } from '@/hooks/useCommissionForm';
import type { useCommissionContact } from '@/hooks/useCommissionContact';
import type { CommissionValidation } from '@/hooks/useCommissionValidation';
import { CommissionIdentityFields } from './CommissionIdentityFields';
import { IdentityMatchPrompt } from './IdentityMatchPrompt';
import { ContactPointPicker } from './ContactPointPicker';

export function CommissionAboutYouFields({
  form,
  contact,
  validation,
}: {
  form: ReturnType<typeof useCommissionForm>;
  contact: ReturnType<typeof useCommissionContact>;
  validation: CommissionValidation;
}) {
  return (
    <div className="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
      <CommissionIdentityFields form={form} validation={validation} />
      <div className="col-span-full empty:hidden">
        <IdentityMatchPrompt form={form} />
      </div>
      <ContactPointPicker contact={contact} validation={validation} />
    </div>
  );
}
