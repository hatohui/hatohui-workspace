import { Skeleton } from '@hatohui/ui';
import { FILTER_CHIP_SKELETON_WIDTHS } from '../../constants/skeleton';
import { FILTER_CHIP_PREVIEW_LIMIT } from '../../constants/travel';
import SkeletonReveal from '../shared/SkeletonReveal';

function FilterChipsSkeleton({ count = FILTER_CHIP_PREVIEW_LIMIT }) {
  return (
    <SkeletonReveal className="flex flex-wrap gap-1">
      {FILTER_CHIP_SKELETON_WIDTHS.slice(0, count).map((width, index) => (
        <Skeleton
          key={index}
          className="h-8 rounded-full sm:h-7"
          style={{ width }}
        />
      ))}
    </SkeletonReveal>
  );
}

export default FilterChipsSkeleton;
