import { Link } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import { cn } from '@hatohui/ui';
import type { TravelDishDto } from '@hatohui/models';
import routes from '../../constants/routes';
import { useMyAllergies } from '../../hooks/useMyAllergies';
import { dishAvailability } from '../../lib/dishAvailability';
import { isOptimisticId } from '../../lib/optimistic';
import CategoryChips from '../shared/CategoryChips';
import CuisineChips from '../shared/CuisineChips';
import ImageFrame from '../shared/ImageFrame';
import OptimisticBadge from '../shared/OptimisticBadge';

function DishCard({ dish }: { dish: TravelDishDto }) {
  const { t } = useTranslation();
  const { cautionFor } = useMyAllergies();
  const availability = dishAvailability(dish);
  const isOptimistic = isOptimisticId(dish.id);
  const cardClass = cn(
    'group flex flex-col gap-1.5 rounded-xl text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
    isOptimistic && 'cursor-wait opacity-85',
  );

  const body = (
    <>
      <div className="relative w-full">
        <ImageFrame
          src={dish.coverImageUrl}
          alt={dish.name}
          caution={cautionFor(dish.allergens)}
        />
        {isOptimistic && <OptimisticBadge />}
      </div>
      <div className="min-w-0">
        <h2 className="truncate text-sm font-medium group-hover:underline">
          {dish.name}
        </h2>
        <p
          className={cn(
            'text-xs text-muted-foreground',
            availability.isMissing && 'italic',
          )}
        >
          {t(availability.key, { count: availability.count })}
        </p>
      </div>
      {(dish.categories.length > 0 || dish.cuisines.length > 0) && (
        <div className="flex flex-wrap gap-1">
          <CategoryChips categories={dish.categories} />
          <CuisineChips cuisines={dish.cuisines} />
        </div>
      )}
    </>
  );

  if (isOptimistic) {
    return (
      <div aria-busy="true" className={cardClass}>
        {body}
      </div>
    );
  }

  return (
    <Link to={routes.dish(dish.id)} className={cardClass}>
      {body}
    </Link>
  );
}

export default DishCard;
