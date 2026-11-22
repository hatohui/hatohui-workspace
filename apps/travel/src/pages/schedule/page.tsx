import { Link } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import { useAuth } from '@hatohui/libs';
import { Button } from '@hatohui/ui';
import { CalendarDays, Settings } from 'lucide-react';
import LeaveBalanceCards from '../../components/schedule/LeaveBalanceCards';
import LeaveHeatmap from '../../components/schedule/LeaveHeatmap';
import ScheduleCalendar from '../../components/schedule/ScheduleCalendar';
import EmptyState from '../../components/shared/EmptyState';
import routes from '../../constants/routes';
import { useTravelSchedulePage } from '../../hooks/useTravelSchedulePage';

function SchedulePage() {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  const schedule = useTravelSchedulePage(Boolean(user));

  if (!isLoading && !user) {
    return (
      <EmptyState icon={CalendarDays} message={t('schedule.signInPrompt')} />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('schedule.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('schedule.subtitle')}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to={routes.settingsSchedule}>
            <Settings className="size-4" aria-hidden />
            {t('nav.settings')}
          </Link>
        </Button>
      </div>

      <LeaveBalanceCards
        balance={schedule.balance}
        isLoading={schedule.isLoadingBalance}
      />

      <ScheduleCalendar
        month={schedule.month}
        cells={schedule.cells}
        isLoading={schedule.isLoadingCalendar}
        onPrev={schedule.prevMonth}
        onNext={schedule.nextMonth}
        onToday={schedule.goToday}
      />

      <LeaveHeatmap year={schedule.year} entries={schedule.heatmap} />
    </div>
  );
}

export default SchedulePage;
