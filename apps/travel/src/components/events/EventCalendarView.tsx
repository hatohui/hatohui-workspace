import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import type { TravelEventDto } from '@hatohui/models';
import { Button } from '@hatohui/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { WEEKDAY_KEYS } from '../../constants/schedule';

interface EventCalendarViewProps {
  events: TravelEventDto[];
  onSelect: (event: TravelEventDto) => void;
}

function EventCalendarView({ events, onSelect }: EventCalendarViewProps) {
  const { t, i18n } = useTranslation();
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const cells: Array<{ key: string; day: number | null; date: Date | null }> =
    [];
  for (let i = 0; i < firstWeekday; i++) {
    cells.push({ key: `pad-${i}`, day: null, date: null });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      key: `${year}-${monthIndex + 1}-${day}`,
      day,
      date: new Date(year, monthIndex, day),
    });
  }

  const eventsOnDay = (dayDate: Date) => {
    const startMs = new Date(
      dayDate.getFullYear(),
      dayDate.getMonth(),
      dayDate.getDate(),
      0,
      0,
      0,
    ).getTime();
    const endMs = startMs + 24 * 60 * 60 * 1000 - 1;
    return events.filter(
      (ev) =>
        new Date(ev.startAt).getTime() <= endMs &&
        new Date(ev.endAt).getTime() >= startMs,
    );
  };

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-base font-medium capitalize">
          {month.toLocaleDateString(i18n.language, {
            month: 'long',
            year: 'numeric',
          })}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('schedule.previousMonth')}
            onClick={() => setMonth(new Date(year, monthIndex - 1, 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('schedule.nextMonth')}
            onClick={() => setMonth(new Date(year, monthIndex + 1, 1))}
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

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((cell) => (
          <div
            key={cell.key}
            className="min-h-20 rounded-lg border border-border/60 bg-background p-1 text-xs"
          >
            {cell.day && (
              <>
                <div className="font-medium tabular-nums">{cell.day}</div>
                <div className="mt-1 space-y-0.5">
                  {cell.date &&
                    eventsOnDay(cell.date).map((ev) => (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => onSelect(ev)}
                        className="block w-full truncate rounded bg-primary/15 px-1 py-0.5 text-left text-[11px] font-medium text-primary hover:bg-primary/25"
                      >
                        {ev.title}
                      </button>
                    ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default EventCalendarView;
