import { useTranslation } from '@hatohui/i18n';
import type { TravelEventDto } from '@hatohui/models';
import EventCard from './EventCard';

interface EventTimelineProps {
  events: TravelEventDto[];
  onSelect: (event: TravelEventDto) => void;
}

function EventTimeline({ events, onSelect }: EventTimelineProps) {
  const { i18n } = useTranslation();

  const groups = new Map<string, { label: string; items: TravelEventDto[] }>();
  for (const event of events) {
    const start = new Date(event.startAt);
    const key = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;
    const label = start.toLocaleDateString(i18n.language, {
      month: 'long',
      year: 'numeric',
    });
    const bucket = groups.get(key) ?? { label, items: [] };
    bucket.items.push(event);
    groups.set(key, bucket);
  }

  return (
    <div className="space-y-8">
      {Array.from(groups.entries()).map(([key, group]) => (
        <section key={key} className="space-y-3">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            {group.label}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((event) => (
              <EventCard key={event.id} event={event} onSelect={onSelect} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default EventTimeline;
