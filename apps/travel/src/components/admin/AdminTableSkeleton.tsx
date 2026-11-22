import { Skeleton } from '@hatohui/ui';
import { ADMIN_SKELETON_ROWS } from '../../constants/skeleton';
import SkeletonReveal from '../shared/SkeletonReveal';
import AdminSkeletonRow from './AdminSkeletonRow';

function AdminTableSkeleton({ columns }: { columns: number }) {
  const rows = Array.from({ length: ADMIN_SKELETON_ROWS }, (_, index) => index);
  return (
    <SkeletonReveal className="space-y-4">
      <div className="hidden max-h-[70dvh] overflow-hidden rounded-md border border-border sm:block">
        <AdminSkeletonRow columns={columns} offset={0} header />
        {rows.map((row) => (
          <AdminSkeletonRow key={row} columns={columns} offset={row} />
        ))}
      </div>
      <div className="space-y-3 sm:hidden">
        {rows.slice(0, 3).map((row) => (
          <Skeleton key={row} className="h-40 w-full rounded-md" />
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-4 w-36" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-40" />
        </div>
      </div>
    </SkeletonReveal>
  );
}

export default AdminTableSkeleton;
