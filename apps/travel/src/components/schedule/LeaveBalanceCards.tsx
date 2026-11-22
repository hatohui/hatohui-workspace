import { Link } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import type { TravelLeaveBalanceDto } from '@hatohui/models';
import { Button } from '@hatohui/ui';
import { CalendarClock, Settings2 } from 'lucide-react';
import routes from '../../constants/routes';
import LeaveBalanceSkeleton from './LeaveBalanceSkeleton';

interface LeaveBalanceCardsProps {
  balance: TravelLeaveBalanceDto | null;
  isLoading: boolean;
}

function LeaveBalanceCards({ balance, isLoading }: LeaveBalanceCardsProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return <LeaveBalanceSkeleton />;
  }

  if (!balance) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-5">
        <div className="flex items-start gap-3">
          <CalendarClock className="mt-0.5 size-5 text-primary" aria-hidden />
          <div>
            <h2 className="font-medium">{t('schedule.noProfileTitle')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('schedule.noProfileHint')}
            </p>
          </div>
        </div>
        <Button asChild size="sm">
          <Link to={routes.settingsLeave}>{t('schedule.setupProfile')}</Link>
        </Button>
      </div>
    );
  }

  const buckets = [
    { key: 'annual', label: t('schedule.annualLeave'), ...balance.annual },
    { key: 'sick', label: t('schedule.sickLeave'), ...balance.sick },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          {t('schedule.cycleRange', {
            from: balance.cycleFrom.slice(0, 10),
            to: balance.cycleTo.slice(0, 10),
          })}
        </span>
        <Button asChild variant="ghost" size="sm" className="h-7 gap-1.5 px-2">
          <Link to={routes.settingsLeave}>
            <Settings2 className="size-3.5" aria-hidden />
            {t('schedule.configure')}
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {buckets.map((bucket) => {
          const pct =
            bucket.total > 0
              ? Math.min(100, Math.round((bucket.used / bucket.total) * 100))
              : 0;
          return (
            <div
              key={bucket.key}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium">{bucket.label}</span>
                <span className="text-xs text-muted-foreground">
                  {t('schedule.daysUsed', { used: bucket.used })}
                </span>
              </div>
              <p className="mt-2 text-2xl font-semibold tabular-nums">
                {t('schedule.daysRemaining', {
                  remaining: bucket.remaining,
                  total: bucket.total,
                })}
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LeaveBalanceCards;
