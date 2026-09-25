'use client';

import Link from 'next/link';
import { useTranslation } from '@hatohui/i18n';
import { cn } from '@hatohui/ui';
import {
  DASHBOARD_STAT_ICONS,
  type DashboardStatKey,
} from '@/constants/dashboard';

export function DashboardStatCard({
  statKey,
  value,
  highlight,
  caption,
  href,
}: {
  statKey: DashboardStatKey;
  value: string;
  highlight: boolean;
  caption?: string;
  href?: string;
}) {
  const { t } = useTranslation('art');
  const Icon = DASHBOARD_STAT_ICONS[statKey];

  const className = cn(
    'flex flex-col justify-between gap-6 rounded-xl border p-5',
    highlight
      ? 'border-primary/30 bg-primary/10'
      : 'border-transparent bg-card',
    href &&
      'transition-colors duration-200 hover:border-border focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none motion-reduce:transition-none',
  );
  const Root = href ? Link : 'div';

  return (
    <Root href={href ?? ''} className={className}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">
          {t(`app.dashboard.stats.${statKey}`)}
        </span>
        <Icon
          className={cn(
            'size-4',
            highlight ? 'text-primary' : 'text-muted-foreground',
          )}
          aria-hidden
        />
      </div>
      <div>
        <p className="font-serif text-3xl leading-none tabular-nums sm:text-4xl">
          {value}
        </p>
        {caption && (
          <p className="mt-2 truncate text-xs text-muted-foreground">
            {caption}
          </p>
        )}
      </div>
    </Root>
  );
}
