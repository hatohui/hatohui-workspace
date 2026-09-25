'use client';

import { useTranslation } from '@hatohui/i18n';
import { cn } from '@hatohui/ui';
import { OPENING_END_MODES } from '@/constants/commission';
import type { OpeningEndMode } from '@/hooks/useOpeningForm';

export function OpeningEndModePicker({
  value,
  onChange,
}: {
  value: OpeningEndMode;
  onChange: (mode: OpeningEndMode) => void;
}) {
  const { t } = useTranslation('art');

  return (
    <fieldset className="space-y-1.5">
      <legend className="mb-1.5 text-sm font-medium">
        {t('commission.admin.opening.endMode')}
      </legend>
      <div className="grid gap-2 sm:grid-cols-3">
        {OPENING_END_MODES.map((mode) => (
          <label
            key={mode}
            className={cn(
              'flex cursor-pointer flex-col gap-1 rounded-lg border p-3 transition-colors duration-200 has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50 motion-reduce:transition-none',
              value === mode
                ? 'border-primary bg-primary/5'
                : 'border-border hover:bg-muted',
            )}
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <input
                type="radio"
                name="opening-end-mode"
                value={mode}
                checked={value === mode}
                onChange={() => onChange(mode)}
                className="accent-primary"
              />
              {t(`commission.admin.opening.endModeOption.${mode}`)}
            </span>
            <span className="text-xs text-muted-foreground">
              {t(`commission.admin.opening.endModeHint.${mode}`)}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
