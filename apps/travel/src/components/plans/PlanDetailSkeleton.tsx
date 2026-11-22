import { Skeleton } from '@hatohui/ui';
import SkeletonLine from '../shared/SkeletonLine';
import SkeletonReveal from '../shared/SkeletonReveal';
import PlanTimelineSkeleton from './PlanTimelineSkeleton';

function PlanDetailSkeleton() {
  return (
    <SkeletonReveal className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <SkeletonLine box="h-8" className="h-6 w-56" />
          <SkeletonLine box="mt-1 h-5" className="h-3.5 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      <div className="flex gap-1 border-b border-border pb-2">
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-7 w-20" />
      </div>
      <PlanTimelineSkeleton />
    </SkeletonReveal>
  );
}

export default PlanDetailSkeleton;
