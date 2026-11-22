import { EVENT_SKELETON_COUNT } from '../../constants/skeleton';
import type { EventViewMode } from '../../hooks/useTravelEventsPage';
import SkeletonLine from '../shared/SkeletonLine';
import SkeletonReveal from '../shared/SkeletonReveal';
import EventCalendarSkeleton from './EventCalendarSkeleton';
import EventCardSkeleton from './EventCardSkeleton';

function EventGridSkeleton({ view }: { view: EventViewMode }) {
  if (view === 'calendar') return <EventCalendarSkeleton />;
  return (
    <SkeletonReveal className="space-y-3">
      {view === 'timeline' && <SkeletonLine box="h-5" className="h-3 w-28" />}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: EVENT_SKELETON_COUNT }, (_, index) => (
          <EventCardSkeleton key={index} />
        ))}
      </div>
    </SkeletonReveal>
  );
}

export default EventGridSkeleton;
