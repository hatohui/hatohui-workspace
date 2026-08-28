'use client';

import Link from 'next/link';
import { useTranslation } from '@hatohui/i18n';
import { DoorClosed } from 'lucide-react';
import { Button } from '@hatohui/ui';
import type { CommissionOpeningDto } from '@hatohui/models';

export function CommissionClosedNotice({
  opening,
  artistHandle,
}: {
  opening: CommissionOpeningDto | undefined;
  artistHandle: string;
}) {
  const { t } = useTranslation('art');

  const detail =
    opening?.status === 'SCHEDULED' && opening.scheduledAt
      ? t('commission.closed.opensAt', {
          date: new Date(opening.scheduledAt).toLocaleDateString(),
        })
      : opening?.status === 'CLOSED' && opening.closedAt
        ? t('commission.closed.lastOpenAt', {
            date: new Date(opening.closedAt).toLocaleDateString(),
          })
        : null;

  return (
    <div className="space-y-5 text-center">
      <DoorClosed
        className="mx-auto size-9 text-muted-foreground"
        aria-hidden
      />
      <div className="space-y-1.5">
        <h1 className="font-serif text-2xl">{t('commission.closed.title')}</h1>
        <p className="text-muted-foreground">{t('commission.closed.body')}</p>
        {detail && (
          <p className="text-sm text-muted-foreground tabular-nums">{detail}</p>
        )}
      </div>
      <Button asChild variant="outline">
        <Link href={`/${artistHandle}/queue`}>
          {t('commission.closed.seeQueue')}
        </Link>
      </Button>
    </div>
  );
}
