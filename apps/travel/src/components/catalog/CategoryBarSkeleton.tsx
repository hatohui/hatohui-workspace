import { Skeleton } from '@hatohui/ui';
import { CATEGORY_BAR_SKELETON_WIDTHS } from '../../constants/skeleton';
import SkeletonReveal from '../shared/SkeletonReveal';

function CategoryBarSkeleton() {
  return (
    <SkeletonReveal className="flex flex-nowrap items-center gap-2 overflow-hidden pb-1 sm:flex-wrap sm:pb-0">
      <Skeleton className="h-9 w-16 shrink-0 rounded-lg" />
      <span aria-hidden className="mx-0.5 h-5 w-px shrink-0 bg-border" />
      {CATEGORY_BAR_SKELETON_WIDTHS.map((width, index) => (
        <Skeleton
          key={index}
          className="h-9 shrink-0 rounded-lg"
          style={{ width }}
        />
      ))}
    </SkeletonReveal>
  );
}

export default CategoryBarSkeleton;
