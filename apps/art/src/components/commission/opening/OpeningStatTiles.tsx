'use client';

import { useTranslation } from '@hatohui/i18n';
import type { CommissionOpeningDto } from '@hatohui/models';

const DAY_MS = 86_400_000;

function daysSince(value: string | null): number | null {
  if (!value) return null;
  return Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / DAY_MS),
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-medium tabular-nums">{value}</p>
    </div>
  );
}

export function OpeningStatTiles({
  opening,
}: {
  opening: CommissionOpeningDto;
}) {
  const { t } = useTranslation('art');
  const open = daysSince(opening.openedAt);
  const taken = opening.slotsTaken ?? 0;
  const hasCap = opening.slotCap != null;
  const pct = hasCap
    ? Math.min(100, Math.round((taken / opening.slotCap!) * 100))
    : 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Tile
        label={t('commission.admin.opening.stat.endMode')}
        value={t(`commission.admin.opening.endModeShort.${opening.endMode}`)}
      />
      <div className="rounded-lg border border-border p-4">
        <p className="text-xs text-muted-foreground">
          {t('commission.admin.opening.stat.slots')}
        </p>
        <p className="mt-1 text-lg font-medium tabular-nums">
          {hasCap ? `${taken} / ${opening.slotCap}` : taken}
        </p>
        {hasCap && (
          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={taken}
            aria-valuemin={0}
            aria-valuemax={opening.slotCap ?? undefined}
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </div>
      <Tile
        label={t('commission.admin.opening.stat.daysOpen')}
        value={open != null ? String(open) : '—'}
      />
      <Tile
        label={t('commission.admin.opening.stat.status')}
        value={t(`commission.admin.opening.status.${opening.status}`)}
      />
    </div>
  );
}
