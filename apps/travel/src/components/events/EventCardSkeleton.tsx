import { Skeleton } from '@hatohui/ui';
import SkeletonLine from '../shared/SkeletonLine';

function EventCardSkeleton() {
  return (
    <div
      aria-hidden
      className="flex flex-col overflow-hidden rounded-xl border border-border bg-card"
    >
      <Skeleton className="aspect-[16/9] w-full rounded-none" />
      <div className="flex flex-col gap-1.5 p-3.5">
        <SkeletonLine box="h-6" className="h-4 w-2/3" />
        <SkeletonLine box="h-4" className="h-3 w-1/2" />
        <SkeletonLine box="h-4" className="h-3 w-1/3" />
      </div>
    </div>
  );
}

export default EventCardSkeleton;
