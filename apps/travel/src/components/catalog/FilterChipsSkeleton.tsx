import { Skeleton } from '@hatohui/ui';
import { FILTER_CHIP_SKELETON_WIDTHS } from '../../constants/travel';

function FilterChipsSkeleton() {
  return (
    <div aria-hidden className="flex flex-wrap gap-1">
      {FILTER_CHIP_SKELETON_WIDTHS.map((width, index) => (
        <Skeleton
          key={index}
          className="h-8 rounded-full sm:h-7"
          style={{ width }}
        />
      ))}
    </div>
  );
}

export default FilterChipsSkeleton;
