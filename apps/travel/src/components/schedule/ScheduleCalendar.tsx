import { useTranslation } from '@hatohui/i18n';
import { Button, Skeleton } from '@hatohui/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { WEEKDAY_KEYS } from '../../constants/schedule';
import type { CalendarCell } from '../../hooks/useTravelSchedulePage';

interface ScheduleCalendarProps {
  month: Date;
  cells: CalendarCell[];
  isLoading: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

function ScheduleCalendar({
  month,
  cells,
  isLoading,
  onPrev,
  onNext,
  onToday,
}: ScheduleCalendarProps) {
  const { t, i18n } = useTranslation();
  const monthLabel = month.toLocaleDateString(i18n.language, {
    month: 'long',
    year: 'numeric',
  });

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-medium capitalize">{monthLabel}</h2>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={onToday}>
            {t('schedule.today')}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('schedule.previousMonth')}
            onClick={onPrev}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('schedule.nextMonth')}
            onClick={onNext}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
        {WEEKDAY_KEYS.map((key) => (
          <div key={key} className="py-1">
            {t(`schedule.weekdays.${key}`)}
          </div>
        ))}
      </div>

      {isLoading ? (
        <Skeleton className="mt-2 h-64 w-full rounded-lg" />
      ) : (
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((cell) => (
            <div
              key={cell.dateKey}
              title={cell.holidayName ?? undefined}
              className={[
                'min-h-16 rounded-lg border p-1.5 text-xs transition-colors',
                cell.inCurrentMonth
                  ? 'border-border/60'
                  : 'border-transparent opacity-40',
                !cell.isWorkDay && cell.inCurrentMonth
                  ? 'bg-muted/50'
                  : 'bg-background',
                cell.isToday ? 'ring-2 ring-primary' : '',
              ].join(' ')}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium tabular-nums">
                  {cell.dayNumber}
                </span>
                {cell.leaveIntensity > 0 && (
                  <span className="size-2 rounded-full bg-primary" />
                )}
              </div>
              {cell.holidayName && (
                <p className="mt-1 truncate rounded bg-amber-500/15 px-1 py-0.5 text-[10px] text-amber-700 dark:text-amber-300">
                  {cell.holidayName}
                </p>
              )}
              {cell.exceptionKind === 'work' && (
                <p className="mt-1 truncate text-[10px] text-primary">
                  {t('schedule.forcedWork')}
                </p>
              )}
              {cell.exceptionKind === 'off' && (
                <p className="mt-1 truncate text-[10px] text-muted-foreground">
                  {t('schedule.forcedOff')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default ScheduleCalendar;
