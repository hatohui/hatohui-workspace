'use client';

import { useState, type FocusEvent } from 'react';
import { useTranslation } from '@hatohui/i18n';
import {
  COMMISSION_MIN_DEADLINE_DAYS,
  COMMISSION_REQUIRED_FIELDS,
  EMAIL_REGEX,
  type CommissionRequiredField,
} from '@/constants/commission';
import type { useCommissionForm } from './useCommissionForm';
import type { useCommissionContact } from './useCommissionContact';

export function useCommissionValidation(
  form: ReturnType<typeof useCommissionForm>,
  contact: ReturnType<typeof useCommissionContact>,
) {
  const { t } = useTranslation('art');
  const [touched, setTouched] = useState<CommissionRequiredField[]>([]);
  const [isRevealed, setIsRevealed] = useState(false);

  const { state, needsIdentity } = form;
  const matched = state.matchedIdentity;
  const required = t('commission.form.errors.required');
  const email = state.clientEmail.trim();

  const errors: Record<CommissionRequiredField, string | null> = {
    clientName:
      needsIdentity && !matched && !state.clientName.trim() ? required : null,
    clientEmail:
      !needsIdentity || matched?.hasEmail
        ? null
        : !email
          ? required
          : EMAIL_REGEX.test(email)
            ? null
            : t('commission.form.invalidEmail'),
    contactValue: contact.needsValue && !contact.value.trim() ? required : null,
    idea: form.isIdeaEmpty ? t('commission.form.errors.ideaRequired') : null,
    acceptTerms: state.acceptedTerms
      ? null
      : t('commission.form.errors.acceptTerms'),
    deadline:
      state.deadline &&
      new Date(`${state.deadline}T00:00:00`) < form.earliestDeadline
        ? t('commission.form.errors.deadlineTooSoon', {
            count: COMMISSION_MIN_DEADLINE_DAYS,
          })
        : null,
  };

  const errorFor = (field: CommissionRequiredField) =>
    isRevealed || touched.includes(field) ? errors[field] : null;

  const touch = (field: CommissionRequiredField) =>
    setTouched((prev) => (prev.includes(field) ? prev : [...prev, field]));

  const validate = () => {
    setIsRevealed(true);
    const firstInvalid = COMMISSION_REQUIRED_FIELDS.find(
      (field) => errors[field],
    );
    if (firstInvalid) document.getElementById(firstInvalid)?.focus();
    return !firstInvalid;
  };

  const touchOnLeave =
    (field: CommissionRequiredField) => (event: FocusEvent<HTMLElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget)) touch(field);
    };

  const reset = () => {
    setTouched([]);
    setIsRevealed(false);
  };

  return { errorFor, touch, touchOnLeave, validate, reset };
}

export type CommissionValidation = ReturnType<typeof useCommissionValidation>;
