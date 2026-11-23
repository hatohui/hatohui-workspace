import type {
  TravelRecommendationDishDto,
  TravelRecommendationDto,
} from '@hatohui/models';
import { cn } from '@hatohui/ui';
import { useMyAllergies } from '../../hooks/useMyAllergies';
import { formatPlaceLocation } from '../../lib/formatPlaceLocation';
import { isOptimisticId } from '../../lib/optimistic';
import { visitAllergenKeys, visitDishNames } from '../../lib/visitView';
import ImageFrame from '../shared/ImageFrame';
import OptimisticBadge from '../shared/OptimisticBadge';

interface Props {
  recommendation: TravelRecommendationDto;
  line?: TravelRecommendationDishDto;
  labelMode?: 'dish' | 'place' | 'both';
  onOpen: () => void;
}

function FoodCard({
  recommendation: rec,
  line,
  labelMode = 'dish',
  onOpen,
}: Props) {
  const { cautionFor } = useMyAllergies();
  const isOptimistic = isOptimisticId(rec.id);
  const dishLabel = line?.dish.name ?? visitDishNames(rec);
  const title = labelMode === 'place' ? rec.place.name : dishLabel;
  const sublabel =
    labelMode === 'place'
      ? formatPlaceLocation(rec.place)
      : labelMode === 'both'
        ? rec.place.name
        : '';
  const dish = line?.dish ?? rec.dishes[0]?.dish;

  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={isOptimistic}
      aria-busy={isOptimistic || undefined}
      className={cn(
        'group flex w-full flex-col gap-1.5 rounded-xl text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
        isOptimistic ? 'cursor-wait opacity-85' : 'cursor-pointer',
      )}
    >
      <div className="relative w-full">
        <ImageFrame
          src={
            rec.images[0]?.thumbnailUrl ??
            rec.images[0]?.url ??
            dish?.thumbnailUrl ??
            dish?.imageUrl ??
            null
          }
          alt={title}
          square
          caution={cautionFor(line?.allergens ?? visitAllergenKeys(rec))}
        />
        {isOptimistic && <OptimisticBadge />}
      </div>
      <div className="w-full min-w-0 space-y-0.5">
        <span className="line-clamp-2 text-sm font-medium group-hover:underline">
          {title}
        </span>
        {sublabel && (
          <span className="block truncate text-xs text-muted-foreground">
            {sublabel}
          </span>
        )}
      </div>
    </button>
  );
}

export default FoodCard;
