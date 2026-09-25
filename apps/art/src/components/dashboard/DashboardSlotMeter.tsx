'use client';

import { useTranslation } from '@hatohui/i18n';

export function DashboardSlotMeter({
  taken,
  cap,
  fill,
  since,
}: {
  taken: number;
  cap: number | null;
  fill: number | null;
  since: string | null;
}) {
  const { t } = useTranslation('art');

  return (
    <div className="space-y-2">
      <p className="font-serif text-3xl leading-none tabular-nums">
        {cap != null ? `${taken} / ${cap}` : taken}
        <span className="ml-2 font-sans text-sm opacity-70">
          {t('app.dashboard.opening.slots')}
        </span>
      </p>
      {fill != null && (
        <div
          className="h-1.5 overflow-hidden rounded-full bg-background/20"
          role="progressbar"
          aria-valuenow={taken}
          aria-valuemin={0}
          aria-valuemax={cap ?? undefined}
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${fill}%` }}
          />
        </div>
      )}
      {since && (
        <p className="text-xs opacity-70">
          {t('app.dashboard.opening.since', { date: since })}
        </p>
      )}
    </div>
  );
}
