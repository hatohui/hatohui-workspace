import { cn, Skeleton } from '@hatohui/ui';
import PillsSkeleton from './PillsSkeleton';
import SkeletonLine from './SkeletonLine';

interface Props {
  square?: boolean;
  tagWidths?: readonly string[];
}

function CardSkeleton({ square = false, tagWidths = [] }: Props) {
  return (
    <div aria-hidden className="flex flex-col gap-1.5">
      <Skeleton
        className={cn(
          'w-full rounded-lg',
          square ? 'aspect-square' : 'aspect-[4/3]',
        )}
      />
      <div>
        <SkeletonLine box="h-5" className="h-3.5 w-2/3" />
        <SkeletonLine box="h-4" className="h-3 w-1/2" />
      </div>
      {tagWidths.length > 0 && <PillsSkeleton widths={tagWidths} />}
    </div>
  );
}

export default CardSkeleton;
