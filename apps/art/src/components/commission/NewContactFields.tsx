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

export function NewContactFields({
  contact,
  withEmail,
}: {
  contact: ReturnType<typeof useCommissionContact>;
  withEmail: boolean;
}) {
  const { t } = useTranslation('art');

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
      </div>
      {contact.needsValue && (
        <div className="space-y-1.5">
          <Label htmlFor="contactValue">
            {t('commission.form.contactValueLabel')}
          </Label>
          <Input
            id="contactValue"
            required
            value={contact.value}
            onChange={(event) => contact.setValue(event.target.value)}
          />
        </div>
      )}
    </>
  );
}
