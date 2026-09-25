'use client';

import Link from 'next/link';
import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import { Inbox, ListTodo } from 'lucide-react';
import { DASHBOARD_ROUTES } from '@/constants/dashboard';

export function DashboardHeader({
  greeting,
  today,
}: {
  greeting: string;
  today: string;
}) {
  const { t } = useTranslation('art');

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{today}</p>
        <h1 className="font-serif text-3xl sm:text-4xl">{greeting}</h1>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link href={DASHBOARD_ROUTES.queue}>
            <ListTodo className="size-4" aria-hidden />
            {t('app.dashboard.actions.queue')}
          </Link>
        </Button>
        <Button asChild>
          <Link href={DASHBOARD_ROUTES.requests}>
            <Inbox className="size-4" aria-hidden />
            {t('app.dashboard.actions.requests')}
          </Link>
        </Button>
      </div>
    </header>
  );
}
