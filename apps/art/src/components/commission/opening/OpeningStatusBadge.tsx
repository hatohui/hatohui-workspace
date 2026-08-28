'use client';

import { useTranslation } from '@hatohui/i18n';
import { CalendarClock, CircleDashed, CircleDot } from 'lucide-react';
import type { CommissionOpeningDto } from '@hatohui/models';

type Status = CommissionOpeningDto['status'];

const STYLES: Record<Status, string> = {
  OPEN: 'bg-primary text-primary-foreground',
  SCHEDULED: 'bg-secondary text-secondary-foreground border border-border',
  CLOSED: 'bg-muted text-muted-foreground',
};

const ICONS: Record<Status, typeof CircleDot> = {
  OPEN: CircleDot,
  SCHEDULED: CalendarClock,
  CLOSED: CircleDashed,
};

export function OpeningStatusBadge({ status }: { status: Status }) {
  const { t } = useTranslation('art');
  const Icon = ICONS[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[status]}`}
    >
      <Icon className="size-3.5" aria-hidden />
      {t(`commission.admin.opening.status.${status}`)}
    </span>
  );
}
