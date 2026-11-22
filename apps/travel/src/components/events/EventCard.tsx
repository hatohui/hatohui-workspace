import { useTranslation } from '@hatohui/i18n';
import type { TravelEventDto } from '@hatohui/models';
import { Calendar, Clock, Lock, MapPin, Repeat } from 'lucide-react';

interface EventCardProps {
  event: TravelEventDto;
  onSelect: (event: TravelEventDto) => void;
}

function formatRange(startIso: string, endIso: string, locale: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const fmt = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return start.toDateString() === end.toDateString()
    ? fmt.format(start)
    : `${fmt.format(start)} – ${fmt.format(end)}`;
}

function EventCard({ event, onSelect }: EventCardProps) {
  const { t, i18n } = useTranslation();

  return (
    <button
      type="button"
      onClick={() => onSelect(event)}
      className="group flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition-colors hover:border-primary/50"
    >
      <div className="relative aspect-[16/9] w-full bg-muted">
        {event.thumbnailUrl ? (
          <img
            src={event.thumbnailUrl}
            alt={event.title}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground/40">
            <Calendar className="size-10" aria-hidden />
          </div>
        )}
        <div className="absolute top-2 right-2 flex flex-wrap gap-1">
          {!event.isApproved && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-2 py-0.5 text-[11px] font-medium text-white">
              <Clock className="size-3" aria-hidden />
              {t('events.badges.pending')}
            </span>
          )}
          {event.visibility === 'PRIVATE' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-background/85 px-2 py-0.5 text-[11px] font-medium backdrop-blur">
              <Lock className="size-3" aria-hidden />
              {t('events.badges.private')}
            </span>
          )}
          {event.isYearly && (
            <span className="inline-flex items-center gap-1 rounded-full bg-background/85 px-2 py-0.5 text-[11px] font-medium backdrop-blur">
              <Repeat className="size-3" aria-hidden />
              {t('events.badges.yearly')}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <h3 className="line-clamp-1 font-medium">{event.title}</h3>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="size-3.5 shrink-0" aria-hidden />
          <span>{formatRange(event.startAt, event.endAt, i18n.language)}</span>
        </p>
        {event.location && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{event.location}</span>
          </p>
        )}
      </div>
    </button>
  );
}

export default EventCard;
