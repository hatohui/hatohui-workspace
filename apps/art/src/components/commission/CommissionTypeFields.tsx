'use client';

import { useTranslation } from '@hatohui/i18n';
import {
  Checkbox,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hatohui/ui';
import type { useCommissionForm } from '@/hooks/useCommissionForm';
import { CommissionReferenceExamples } from './CommissionReferenceExamples';
import { InfoTooltip } from '@/components/shared/InfoTooltip';

export function CommissionTypeFields({
  form,
}: {
  form: ReturnType<typeof useCommissionForm>;
}) {
  const { t } = useTranslation('art');
  const { types, options, addons } = form.pricing;

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <div>
        <div className="flex items-center gap-1.5">
          <Label>{t('commission.form.commissionTypeLabel')}</Label>
          {form.state.commissionType && (
            <InfoTooltip
              content={t(
                `commission.type.${form.state.commissionType}.description`,
              )}
            />
          )}
        </div>
        <Select
          value={form.state.commissionType}
          onValueChange={(value) => form.update('commissionType', value)}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={t('commission.form.commissionTypePlaceholder')}
            />
          </SelectTrigger>
          <SelectContent>
            {types.map((type) => (
              <SelectItem key={type.type} value={type.type}>
                {t(`commission.type.${type.type}.label`)} ($
                {(type.basePriceCents / 100).toFixed(0)})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <CommissionReferenceExamples tag={form.state.commissionType} />
      </div>

      <div>
        <div className="flex items-center gap-1.5">
          <Label>{t('commission.form.optionLabel')}</Label>
          {form.state.optionKey && (
            <InfoTooltip
              content={t(
                `commission.option.${form.state.optionKey}.description`,
              )}
            />
          )}
        </div>
        <Select
          value={form.state.optionKey}
          onValueChange={(value) => form.update('optionKey', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('commission.form.optionPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.key} value={option.key}>
                {t(`commission.option.${option.key}.label`)}
                {option.modifierPercent !== 0
                  ? ` (${option.modifierPercent}%)`
                  : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <CommissionReferenceExamples tag={form.state.optionKey} />
      </div>

      {addons.length > 0 && (
        <div>
          <Label>{t('commission.form.addonsLabel')}</Label>
          <div className="mt-1 space-y-2">
            {addons.map((addon) => {
              const checked = form.state.addonKeys.includes(addon.key);
              return (
                <div key={addon.key} className="flex items-center gap-1.5">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) =>
                        form.update(
                          'addonKeys',
                          value === true
                            ? [...form.state.addonKeys, addon.key]
                            : form.state.addonKeys.filter(
                                (key) => key !== addon.key,
                              ),
                        )
                      }
                    />
                    {t(`commission.addon.${addon.key}.label`)} ($
                    {(addon.minPriceCents / 100).toFixed(0)}+)
                  </label>
                  <InfoTooltip
                    content={t(`commission.addon.${addon.key}.description`)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
