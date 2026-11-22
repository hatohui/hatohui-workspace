import { Link } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import { useAuth } from '@hatohui/libs';
import { Button, Input } from '@hatohui/ui';
import {
  Calendar,
  CalendarRange,
  LayoutGrid,
  List,
  Plus,
  Search,
} from 'lucide-react';
import EventCalendarView from '../../components/events/EventCalendarView';
import EventCard from '../../components/events/EventCard';
import EventDetailDialog from '../../components/events/EventDetailDialog';
import EventTimeline from '../../components/events/EventTimeline';
import EmptyState from '../../components/shared/EmptyState';
import routes from '../../constants/routes';
import {
  useTravelEventsPage,
  type EventViewMode,
} from '../../hooks/useTravelEventsPage';
import EventGridSkeleton from '../../components/events/EventGridSkeleton';

const VIEW_OPTIONS: Array<{ mode: EventViewMode; icon: typeof Calendar }> = [
  { mode: 'timeline', icon: List },
  { mode: 'calendar', icon: Calendar },
  { mode: 'list', icon: LayoutGrid },
];

function EventsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const state = useTravelEventsPage();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('events.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('events.subtitle')}
          </p>
        </div>
        {user && (
          <Button asChild size="sm">
            <Link to={routes.eventNew}>
              <Plus className="size-4" aria-hidden />
              {t('events.create')}
            </Link>
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-52 flex-1 sm:max-w-xs">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={state.search}
            placeholder={t('events.searchPlaceholder')}
            className="pl-9"
            onChange={(e) => state.setSearch(e.target.value)}
          />
        </div>

        <div className="inline-flex rounded-lg border border-border bg-muted/60 p-1">
          {VIEW_OPTIONS.map(({ mode, icon: Icon }) => (
            <button
              key={mode}
              type="button"
              onClick={() => state.setView(mode)}
              className={[
                'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                state.view === mode
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              ].join(' ')}
            >
              <Icon className="size-3.5" aria-hidden />
              {t(`events.views.${mode}`)}
            </button>
          ))}
        </div>
      </div>

      {state.isLoading ? (
        <EventGridSkeleton view={state.view} />
      ) : state.events.length === 0 ? (
        <EmptyState icon={CalendarRange} message={t('events.empty')} />
      ) : state.view === 'calendar' ? (
        <EventCalendarView events={state.events} onSelect={state.selectEvent} />
      ) : state.view === 'list' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {state.events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onSelect={state.selectEvent}
            />
          ))}
        </div>
      ) : (
        <EventTimeline events={state.events} onSelect={state.selectEvent} />
      )}

      <EventDetailDialog
        event={state.selectedEvent}
        onClose={() => state.selectEvent(null)}
      />
    </div>
  );
}

export default EventsPage;
