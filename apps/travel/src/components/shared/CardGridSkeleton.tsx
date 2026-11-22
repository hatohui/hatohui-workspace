import { Skeleton } from '@hatohui/ui';
import { CARD_GRID_CLASS } from '../../constants/travel';

const PLACEHOLDER_COUNT = 10;

function CardGridSkeleton() {
  return (
    <div className={CARD_GRID_CLASS}>
      {Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
        <div key={index} className="space-y-1.5">
          <Skeleton className="aspect-[4/3] w-full rounded-lg" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default CardGridSkeleton;
