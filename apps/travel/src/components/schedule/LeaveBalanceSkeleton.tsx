import { Skeleton } from '@hatohui/ui';
import { LEAVE_BUCKET_SKELETON_COUNT } from '../../constants/skeleton';
import SkeletonLine from '../shared/SkeletonLine';
import SkeletonReveal from '../shared/SkeletonReveal';

function LeaveBalanceSkeleton() {
  return (
    <SkeletonReveal className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <SkeletonLine box="h-7" className="h-3 w-48" />
        <Skeleton className="h-7 w-24" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: LEAVE_BUCKET_SKELETON_COUNT }, (_, index) => (
          <div
            key={index}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex justify-between gap-2">
              <SkeletonLine box="h-5" className="h-3.5 w-24" />
              <SkeletonLine box="h-5" className="h-3 w-16" />
            </div>
            <SkeletonLine box="mt-2 h-8" className="h-6 w-1/2" />
            <Skeleton className="mt-3 h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </SkeletonReveal>
  );
}

export default LeaveBalanceSkeleton;
