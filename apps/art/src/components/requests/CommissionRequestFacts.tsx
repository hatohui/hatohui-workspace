'use client';

import { useTranslation } from '@hatohui/i18n';

export function CommissionRequestFacts({
  facts,
}: {
  facts: { key: string; value: string }[];
}) {
  const { t } = useTranslation('art');

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg bg-card p-4 text-sm">
      {facts.map((fact) => (
        <div key={fact.key} className="min-w-0">
          <dt className="text-xs text-muted-foreground">
            {t(`app.requests.panel.${fact.key}`)}
          </dt>
          <dd className="mt-0.5 truncate font-medium tabular-nums">
            {fact.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
