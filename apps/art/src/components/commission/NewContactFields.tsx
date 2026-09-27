'use client';

import { useTranslation } from '@hatohui/i18n';
import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hatohui/ui';
import { EMAIL_CONTACT_PLATFORM } from '@/constants/commission';
import type { useCommissionContact } from '@/hooks/useCommissionContact';
import type { CommissionValidation } from '@/hooks/useCommissionValidation';
import { CommissionFieldError } from './CommissionFieldError';

export function NewContactFields({
  contact,
  withEmail,
  validation,
}: {
  contact: ReturnType<typeof useCommissionContact>;
  withEmail: boolean;
  validation: CommissionValidation;
}) {
  const { t } = useTranslation('art');
  const error = validation.errorFor('contactValue');

  return (
    <>
      <div className="space-y-1.5">
        <Label>
          {withEmail
            ? t('commission.form.contactLabel')
            : t('commission.form.contactPlatformLabel')}
        </Label>
        <Select value={contact.platform} onValueChange={contact.setPlatform}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {withEmail && (
              <SelectItem value={EMAIL_CONTACT_PLATFORM}>
                {t('commission.form.contactEmail')}
              </SelectItem>
            )}
            {contact.platformNames.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {withEmail && (
          <p className="text-xs text-muted-foreground">
            {t('commission.form.hints.contact')}
          </p>
        )}
      </div>
      {contact.needsValue && (
        <div className="space-y-1.5">
          <Label htmlFor="contactValue" required>
            {t('commission.form.contactValueLabel', {
              platform: contact.platform,
            })}
          </Label>
          <Input
            id="contactValue"
            required
            value={contact.value}
            placeholder={t('commission.form.placeholders.contactValue')}
            aria-invalid={error ? true : undefined}
            aria-describedby="contactValue-error"
            onBlur={() => validation.touch('contactValue')}
            onChange={(event) => contact.setValue(event.target.value)}
          />
          <CommissionFieldError
            id="contactValue-error"
            message={error}
            hint={t('commission.form.hints.contactValue')}
          />
        </div>
      )}
    </>
  );
}
