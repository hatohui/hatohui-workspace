import type { TravelRecommendationDto } from '@hatohui/models';
import { cn } from '@hatohui/ui';
import { useMyAllergies } from '../../hooks/useMyAllergies';
import { formatPlaceLocation } from '../../lib/formatPlaceLocation';
import { isOptimisticId } from '../../lib/optimistic';
import ImageFrame from '../shared/ImageFrame';
import OptimisticBadge from '../shared/OptimisticBadge';

interface Props {
  recommendation: TravelRecommendationDto;
  labelMode?: 'dish' | 'place' | 'both';
  onOpen: () => void;
}

function FoodCard({ recommendation: rec, labelMode = 'dish', onOpen }: Props) {
  const { cautionFor } = useMyAllergies();
  const isOptimistic = isOptimisticId(rec.id);
  const title = labelMode === 'place' ? rec.place.name : rec.dish.name;
  const sublabel =
    labelMode === 'place'
      ? formatPlaceLocation(rec.place)
      : labelMode === 'both'
        ? rec.place.name
        : '';

  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={isOptimistic}
      aria-busy={isOptimistic || undefined}
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition-colors outline-none hover:border-primary/50 focus-visible:ring-[3px] focus-visible:ring-ring/50',
        isOptimistic ? 'cursor-wait opacity-85' : 'cursor-pointer',
      )}
    >
      <div className="relative w-full">
        <ImageFrame
          src={
            rec.images[0]?.thumbnailUrl ??
            rec.images[0]?.url ??
            rec.dish.thumbnailUrl ??
            rec.dish.imageUrl ??
            null
          }
          alt={title}
          square
          flush
          caution={cautionFor(rec.allergens)}
        />
        {isOptimistic && <OptimisticBadge />}
      </div>
      <div className="flex flex-1 flex-col gap-0.5 p-3">
        <span className="line-clamp-2 block text-sm font-medium transition-colors group-hover:text-primary">
          {title}
        </span>
        {sublabel && (
          <span className="line-clamp-1 block text-xs text-muted-foreground">
            {sublabel}
          </span>
        )}
      </div>
    </button>
  );
}

export default FoodCard;
