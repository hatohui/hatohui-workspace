import { Skeleton } from '@hatohui/ui';
import { FORM_SKELETON_FIELDS } from '../../constants/skeleton';
import SkeletonLine from './SkeletonLine';
import SkeletonReveal from './SkeletonReveal';

function FormCardSkeleton({ fields = FORM_SKELETON_FIELDS }) {
  return (
    <SkeletonReveal className="max-w-2xl space-y-4 rounded-xl border border-border bg-card p-5">
      <div>
        <SkeletonLine box="h-6" className="h-4 w-40" />
        <SkeletonLine box="h-5" className="h-3.5 w-2/3" />
      </div>
      {Array.from({ length: fields }, (_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
      <Skeleton className="h-9 w-24" />
    </SkeletonReveal>
  );
}

export default FormCardSkeleton;
