import { Skeleton } from '@hatohui/ui';
import {
  CATALOG_CARD_TAG_WIDTHS,
  DETAIL_GRID_SKELETON_COUNT,
} from '../../constants/skeleton';
import { CARD_GRID_CLASS } from '../../constants/travel';
import CardSkeleton from './CardSkeleton';
import PillsSkeleton from './PillsSkeleton';
import SkeletonLine from './SkeletonLine';
import SkeletonReveal from './SkeletonReveal';

function DetailPageSkeleton({ withImage }: { withImage: boolean }) {
  return (
    <SkeletonReveal className="space-y-8">
      <SkeletonLine box="h-7" className="h-4 w-28" />
      <div className="flex flex-col gap-5 border-b border-border/60 pb-6 sm:flex-row sm:items-start">
        {withImage && (
          <Skeleton className="aspect-[4/3] w-44 shrink-0 rounded-xl" />
        )}
        <div className="min-w-0 flex-1 space-y-3">
          <SkeletonLine box="h-9" className="h-7 w-1/3 min-w-40" />
          <PillsSkeleton widths={CATALOG_CARD_TAG_WIDTHS} />
          <div className="max-w-prose space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-7 w-32 rounded-full" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <SkeletonLine box="h-7" className="h-5 w-40" />
        <div className={CARD_GRID_CLASS}>
          {Array.from({ length: DETAIL_GRID_SKELETON_COUNT }, (_, index) => (
            <CardSkeleton key={index} square />
          ))}
        </div>
      </div>
    </SkeletonReveal>
  );
}

export default DetailPageSkeleton;
