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
import type { CommissionAddonPricingDto } from '@hatohui/models';
import type { useCommissionForm } from '@/hooks/useCommissionForm';
import { CommissionReferenceExamples } from './CommissionReferenceExamples';
import { InfoTooltip } from '@/components/shared/InfoTooltip';

function formatAddonPrice(addon: CommissionAddonPricingDto): string {
  const min = addon.minPrice != null ? (addon.minPrice / 100).toFixed(0) : '0';
  switch (addon.priceMode) {
    case 'FIXED':
      return `$${min}`;
    case 'RANGE':
      return addon.maxPrice != null
        ? `$${min}–$${(addon.maxPrice / 100).toFixed(0)}`
        : `$${min}+`;
    case 'PERCENTAGE':
      return `${addon.percent ?? 0}%`;
    default:
      return `$${min}+`;
  }
}

export function CommissionTypeFields({
  form,
  artistId,
}: {
  form: ReturnType<typeof useCommissionForm>;
  artistId: string;
}) {
  const { t } = useTranslation('art');
  const { types, optionsForType, addons } = form.pricing;
  const selectedType = types.find(
    (type) => type.id === form.state.commissionTypeId,
  );
  const hasOptionChoice = optionsForType.length > 1;

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <div>
        <div className="flex items-center gap-1.5">
          <Label>{t('commission.form.commissionTypeLabel')}</Label>
          {selectedType && (
            <InfoTooltip
              content={t(`commission.type.${selectedType.key}.description`)}
            />
          )}
        </div>
        <Select
          value={form.state.commissionTypeId}
          onValueChange={(value) => {
            form.update('commissionTypeId', value);
            form.update('optionKey', '');
          }}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={t('commission.form.commissionTypePlaceholder')}
            />
          </SelectTrigger>
          <SelectContent>
            {types.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {t(`commission.type.${type.key}.label`, {
                  defaultValue: type.label,
                })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <CommissionReferenceExamples
          artistId={artistId}
          tag={selectedType?.tagName ?? undefined}
        />
      </div>

      {hasOptionChoice && (
        <div>
          <div className="flex items-center gap-1.5">
            <Label>{t('commission.form.optionLabel')}</Label>
          </div>
          <Select
            value={form.state.optionKey}
            onValueChange={(value) => form.update('optionKey', value)}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={t('commission.form.optionPlaceholder')}
              />
            </SelectTrigger>
            <SelectContent>
              {optionsForType.map((option) => (
                <SelectItem key={option.key} value={option.key}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

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
                    {addon.label} ({formatAddonPrice(addon)})
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
