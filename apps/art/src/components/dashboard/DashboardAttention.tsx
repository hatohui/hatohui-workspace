'use client';

import Link from 'next/link';
import { BellRing, DoorOpen } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Button, cn } from '@hatohui/ui';
import { DASHBOARD_ROUTES } from '@/constants/dashboard';

export function DashboardAttention({
  message,
  hasWaiting,
}: {
  message: string | null;
  hasWaiting: boolean;
}) {
  const { t } = useTranslation('art');

  if (!message) return null;

  const Icon = hasWaiting ? BellRing : DoorOpen;

  return (
    <section
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 rounded-xl px-5 py-4',
        hasWaiting ? 'bg-primary/10' : 'bg-card',
      )}
    >
      <p className="flex items-center gap-3 font-medium">
        <Icon
          className={cn(
            'size-5 shrink-0',
            hasWaiting ? 'text-primary' : 'text-muted-foreground',
          )}
          aria-hidden
        />
        {message}
      </p>
      {hasWaiting && (
        <Button asChild size="sm">
          <Link href={DASHBOARD_ROUTES.requests}>
            {t('app.dashboard.attention.review')}
          </Link>
        </Button>
      )}
    </section>
  );
}
