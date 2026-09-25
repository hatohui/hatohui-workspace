'use client';

import Link from 'next/link';
import { useTranslation } from '@hatohui/i18n';
import { Button, cn } from '@hatohui/ui';
import type { CommissionOpeningDto } from '@hatohui/models';
import { DASHBOARD_ROUTES } from '@/constants/dashboard';
import { DashboardSlotMeter } from './DashboardSlotMeter';

export function DashboardOpeningCard({
  opening,
}: {
  opening: {
    status: CommissionOpeningDto['status'];
    slotsTaken: number;
    slotCap: number | null;
    slotSummary: string;
    fill: number | null;
    since: string | null;
    scheduledFor: string | null;
  };
}) {
  const { t } = useTranslation('art');
  const isOpen = opening.status === 'OPEN';

  return (
    <section
      className={cn(
        'space-y-4 rounded-xl p-5',
        isOpen ? 'bg-foreground text-background' : 'bg-card',
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'size-2 rounded-full',
            isOpen ? 'animate-pulse bg-primary' : 'bg-muted-foreground/50',
          )}
        />
        <span className="text-sm font-medium">
          {t(`app.dashboard.opening.${opening.status}`)}
        </span>
      </div>

      {isOpen && (
        <DashboardSlotMeter
          summary={opening.slotSummary}
          taken={opening.slotsTaken}
          cap={opening.slotCap}
          fill={opening.fill}
          since={opening.since}
        />
      )}
      {opening.status === 'SCHEDULED' && opening.scheduledFor && (
        <p className="text-sm text-muted-foreground">
          {t('app.dashboard.opening.scheduledFor', {
            date: opening.scheduledFor,
          })}
        </p>
      )}

      <Button
        asChild
        size="sm"
        variant={isOpen ? 'secondary' : 'default'}
        className="w-full"
      >
        <Link href={DASHBOARD_ROUTES.commissions}>
          {t(
            isOpen
              ? 'app.dashboard.opening.manage'
              : 'app.dashboard.opening.cta',
          )}
        </Link>
      </Button>
    </section>
  );
}
