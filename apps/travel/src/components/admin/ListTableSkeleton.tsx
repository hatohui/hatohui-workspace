import { Skeleton } from '@hatohui/ui';
import { ADMIN_SKELETON_ROWS } from '../../constants/skeleton';
import SkeletonLine from '../shared/SkeletonLine';
import SkeletonReveal from '../shared/SkeletonReveal';

function ListTableSkeleton({ withHeader = false }: { withHeader?: boolean }) {
  return (
    <SkeletonReveal className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
      {withHeader && (
        <div className="flex h-9 items-center bg-muted/50 px-3">
          <Skeleton className="h-3 w-1/3" />
        </div>
      )}
      {Array.from({ length: ADMIN_SKELETON_ROWS }, (_, index) => (
        <div
          key={index}
          className="flex items-center justify-between gap-3 px-3 py-2.5"
        >
          <div className="min-w-0 flex-1">
            <SkeletonLine box="h-5" className="h-3.5 w-1/3" />
            <SkeletonLine box="h-4" className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </SkeletonReveal>
  );
}

export default ListTableSkeleton;
