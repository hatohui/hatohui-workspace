import { Skeleton } from '@hatohui/ui';
import { CALENDAR_SKELETON_CELLS } from '../../constants/skeleton';
import SkeletonLine from '../shared/SkeletonLine';
import SkeletonReveal from '../shared/SkeletonReveal';

function EventCalendarSkeleton() {
  return (
    <SkeletonReveal className="rounded-xl border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between gap-2">
        <SkeletonLine box="h-6" className="h-4 w-32" />
        <Skeleton className="h-8 w-20" />
      </div>
      <SkeletonLine box="h-6" className="h-3 w-full" />
      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: CALENDAR_SKELETON_CELLS }, (_, index) => (
          <Skeleton key={index} className="min-h-20 rounded-lg" />
        ))}
      </div>
    </SkeletonReveal>
  );
}

export default EventCalendarSkeleton;
