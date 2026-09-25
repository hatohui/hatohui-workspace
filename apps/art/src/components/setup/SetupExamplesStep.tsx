'use client';

import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import { CommissionTypeExamples } from '@/components/commission/CommissionTypeExamples';

export function SetupExamplesStep({
  types,
  onBack,
}: {
  types: { id: string; key: string; label: string; tagName: string | null }[];
  onBack: () => void;
}) {
  const { t } = useTranslation('art');

  if (types.length === 0) {
    return (
      <div className="space-y-3 rounded-lg border border-dashed border-border p-6 text-center">
        <p className="text-sm text-muted-foreground">
          {t('app.setup.examplesNeedTypes')}
        </p>
        <Button variant="outline" onClick={onBack}>
          {t('app.setup.steps.pricing.short')}
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {types.map((type) => (
        <section
          key={type.id}
          className="space-y-3 rounded-lg border border-border p-4"
        >
          <h3 className="font-medium">
            {t(`commission.type.${type.key}.label`, {
              defaultValue: type.label,
            })}
          </h3>
          <CommissionTypeExamples tagName={type.tagName} />
        </section>
      ))}
    </div>
  );
}
