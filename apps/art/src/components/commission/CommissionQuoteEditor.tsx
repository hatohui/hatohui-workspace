'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import type {
  CommissionDto,
  UpdateCommissionQuoteDtoCommissionType,
} from '@hatohui/models';
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hatohui/ui';
import { useCommissionPricingEstimate } from '@/hooks/useCommissionPricingEstimate';
import { PAYMENT_STATUS_OPTIONS } from '@/constants/commission';

export function CommissionQuoteEditor({
  commission,
  paymentStatus,
  onSaveQuote,
  onSavePaymentStatus,
}: {
  commission: CommissionDto;
  paymentStatus: CommissionDto['paymentStatus'];
  onSaveQuote: (data: {
    commissionType?: UpdateCommissionQuoteDtoCommissionType | null;
    optionKey?: string | null;
    addonKeys?: string[];
    quoteCents?: number | null;
  }) => Promise<unknown>;
  onSavePaymentStatus: (
    status: CommissionDto['paymentStatus'],
  ) => Promise<unknown>;
}) {
  const { t } = useTranslation('art');
  const pricing = useCommissionPricingEstimate(
    commission.commissionType ?? undefined,
    commission.optionKey ?? undefined,
    commission.addonKeys,
  );
  const [quoteInput, setQuoteInput] = useState(
    commission.quoteCents !== null ? String(commission.quoteCents / 100) : '',
  );

  return (
    <div className="grid grid-cols-2 gap-4 rounded-lg border border-border p-4">
      <div>
        <Label>{t('commission.form.commissionTypeLabel')}</Label>
        <Select
          value={commission.commissionType ?? ''}
          onValueChange={(value) =>
            void onSaveQuote({
              commissionType: value as UpdateCommissionQuoteDtoCommissionType,
            })
          }
        >
          <SelectTrigger>
            <SelectValue
              placeholder={t('commission.form.commissionTypePlaceholder')}
            />
          </SelectTrigger>
          <SelectContent>
            {pricing.types.map((type) => (
              <SelectItem key={type.type} value={type.type}>
                {t(`commission.type.${type.type}.label`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>{t('commission.form.optionLabel')}</Label>
        <Select
          value={commission.optionKey ?? ''}
          onValueChange={(value) => void onSaveQuote({ optionKey: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('commission.form.optionPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {pricing.options.map((option) => (
              <SelectItem key={option.key} value={option.key}>
                {t(`commission.option.${option.key}.label`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="quoteCents">
          {t('commission.form.estimateLabel')} ($)
        </Label>
        <div className="flex gap-2">
          <Input
            id="quoteCents"
            type="number"
            value={quoteInput}
            onChange={(event) => setQuoteInput(event.target.value)}
          />
          <Button
            size="sm"
            onClick={() =>
              void onSaveQuote({
                quoteCents: quoteInput
                  ? Math.round(Number(quoteInput) * 100)
                  : null,
              })
            }
          >
            {t('gallery.upload.save')}
          </Button>
        </div>
      </div>

      <div>
        <Label>{t('commission.admin.detail.paymentStatus')}</Label>
        <Select
          value={paymentStatus}
          onValueChange={(value) =>
            void onSavePaymentStatus(value as CommissionDto['paymentStatus'])
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {t(`commission.paymentStatus.${option}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
