import { Skeleton } from '@hatohui/ui';
import { CALENDAR_SKELETON_CELLS } from '../../constants/skeleton';
import SkeletonReveal from '../shared/SkeletonReveal';

function CalendarGridSkeleton() {
  return (
    <SkeletonReveal className="mt-1 grid grid-cols-7 gap-1">
      {Array.from({ length: CALENDAR_SKELETON_CELLS }, (_, index) => (
        <Skeleton key={index} className="min-h-16 rounded-lg" />
      ))}
    </SkeletonReveal>
  );
}

export default CalendarGridSkeleton;
