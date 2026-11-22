import { Skeleton } from '@hatohui/ui';
import { CARD_GRID_CLASS } from '../../constants/travel';

const PLACEHOLDER_COUNT = 8;

function CardGridSkeleton() {
  return (
    <div className={CARD_GRID_CLASS}>
      {Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border border-border bg-card"
        >
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="space-y-2 p-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default CardGridSkeleton;
