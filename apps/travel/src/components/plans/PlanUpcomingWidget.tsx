import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import { ArrowRight, CalendarClock, MapPin } from 'lucide-react';
import type { TimelineItem } from '../../hooks/useTravelTimeline';

interface PlanUpcomingWidgetProps {
  items: TimelineItem[];
  onOpenTimeline: () => void;
}

function PlanUpcomingWidget({
  items,
  onOpenTimeline,
}: PlanUpcomingWidgetProps) {
  const { t, i18n } = useTranslation();
  const fmt = new Intl.DateTimeFormat(i18n.language, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <section className="space-y-3 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CalendarClock className="size-4 text-primary" aria-hidden />
          <h2 className="text-base font-medium">
            {t('plans.timeline.upcomingTitle')}
          </h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onOpenTimeline}>
          {t('plans.timeline.viewTimeline')}
          <ArrowRight className="size-3.5" aria-hidden />
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t('plans.timeline.noUpcoming')}
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm"
            >
              <div>
                <div className="font-medium">{item.title}</div>
                {item.location && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" aria-hidden />
                    <span>{item.location}</span>
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">
                {fmt.format(new Date(item.from))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default PlanUpcomingWidget;
