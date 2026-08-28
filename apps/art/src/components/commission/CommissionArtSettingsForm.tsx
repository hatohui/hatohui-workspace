'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
  Switch,
  useToast,
} from '@hatohui/ui';
import type {
  CommissionSettingsDto,
  PaymentMethodDto,
  UpsertCommissionSettingsDto,
} from '@hatohui/models';
import { SUPPORTED_CURRENCIES } from '@/constants/commission';
import { PaymentMethodChecklist } from './PaymentMethodChecklist';

export function CommissionArtSettingsForm({
  initial,
  paymentMethods,
  saving,
  onSave,
}: {
  initial: CommissionSettingsDto;
  paymentMethods: PaymentMethodDto[];
  saving: boolean;
  onSave: (dto: UpsertCommissionSettingsDto) => Promise<unknown>;
}) {
  const { t } = useTranslation('art');
  const toast = useToast();
  const [currency, setCurrency] = useState<CommissionSettingsDto['currency']>(
    initial.currency,
  );
  const [autoAccept, setAutoAccept] = useState(initial.autoAccept);
  const [email, setEmail] = useState(initial.notificationEmail ?? '');
  const [methods, setMethods] = useState<string[]>(initial.paymentMethodKeys);

  const save = async () => {
    try {
      await onSave({
        currency,
        autoAccept,
        notificationEmail: email.trim() || null,
        paymentMethodKeys: methods,
      });
      toast.success(t('app.commissionSettings.saved'));
    } catch {
      toast.error(t('app.commissionSettings.saveFailed'));
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="art-currency">
            {t('app.commissionSettings.currency')}
          </Label>
          <Select
            value={currency}
            onValueChange={(value) =>
              setCurrency(value as CommissionSettingsDto['currency'])
            }
          >
            <SelectTrigger id="art-currency" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_CURRENCIES.map((code) => (
                <SelectItem key={code} value={code}>
                  {code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {t('app.commissionSettings.currencyHint')}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="art-notify-email">
            {t('app.commissionSettings.notificationEmail')}
          </Label>
          <Input
            id="art-notify-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={t(
              'app.commissionSettings.notificationEmailPlaceholder',
            )}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            {t('app.commissionSettings.notificationEmailHint')}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Switch
          id="art-auto-accept"
          checked={autoAccept}
          onCheckedChange={setAutoAccept}
        />
        <div className="space-y-0.5">
          <Label htmlFor="art-auto-accept">
            {t('app.commissionSettings.autoAccept')}
          </Label>
          <p className="text-xs text-muted-foreground">
            {t('app.commissionSettings.autoAcceptHint')}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t('app.commissionSettings.paymentMethods')}</Label>
        <p className="text-xs text-muted-foreground">
          {t('app.commissionSettings.paymentMethodsHint')}
        </p>
        <PaymentMethodChecklist
          methods={paymentMethods}
          selected={methods}
          onToggle={(key, checked) =>
            setMethods((prev) =>
              checked ? [...prev, key] : prev.filter((k) => k !== key),
            )
          }
        />
      </div>

      <Button disabled={saving} onClick={() => void save()}>
        {saving && <Spinner className="size-4" />}
        {t('app.commissionSettings.save')}
      </Button>
    </div>
  );
}
