import { useTranslation } from '@hatohui/i18n';
import type { TravelRecommendationDto } from '@hatohui/models';
import { Spinner, cn } from '@hatohui/ui';
import { useMyAllergies } from '../../hooks/useMyAllergies';
import { formatPlaceLocation } from '../../lib/formatPlaceLocation';
import { isOptimisticId } from '../../lib/optimistic';
import ImageFrame from '../shared/ImageFrame';

interface Props {
  recommendation: TravelRecommendationDto;
  labelMode?: 'dish' | 'place' | 'both';
  onOpen: () => void;
}

function FoodCard({ recommendation: rec, labelMode = 'dish', onOpen }: Props) {
  const { t } = useTranslation();
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
        'group flex flex-col gap-2 rounded-xl text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
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
          caution={cautionFor(rec.allergens)}
        />
        {isOptimistic && (
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-full bg-background/85 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm">
            <Spinner className="size-3" />
            {t('form.saving')}
          </span>
        )}
      </div>
      <div className="space-y-0.5">
        <span className="line-clamp-2 block font-medium tracking-tight group-hover:underline">
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
