import { Skeleton } from '@hatohui/ui';
import { TIMELINE_SKELETON_COUNT } from '../../constants/skeleton';
import SkeletonLine from '../shared/SkeletonLine';

function PlanTimelineSkeleton() {
  return (
    <div aria-hidden className="space-y-3">
      {Array.from({ length: TIMELINE_SKELETON_COUNT }, (_, index) => (
        <div
          key={index}
          className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4"
        >
          <div className="flex-1 space-y-1">
            <SkeletonLine box="h-5" className="h-3.5 w-1/3" />
            <SkeletonLine box="h-5" className="h-3 w-1/2" />
          </div>
          <Skeleton className="size-8 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export default PlanTimelineSkeleton;
