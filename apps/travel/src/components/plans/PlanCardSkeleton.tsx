import { Skeleton } from '@hatohui/ui';
import SkeletonLine from '../shared/SkeletonLine';

function PlanCardSkeleton() {
  return (
    <div
      aria-hidden
      className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <SkeletonLine box="h-6" className="h-4 w-1/2" />
          <SkeletonLine box="h-4" className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <div className="flex gap-4">
        <SkeletonLine box="h-4" className="h-3 w-40" />
        <SkeletonLine box="h-4" className="h-3 w-24" />
      </div>
    </div>
  );
}

export default PlanCardSkeleton;
