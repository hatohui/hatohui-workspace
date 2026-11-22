import { Link } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import { cn } from '@hatohui/ui';
import type { TravelDishDto } from '@hatohui/models';
import routes from '../../constants/routes';
import { useMyAllergies } from '../../hooks/useMyAllergies';
import { dishAvailability } from '../../lib/dishAvailability';
import CuisineChips from '../shared/CuisineChips';
import ImageFrame from '../shared/ImageFrame';

function DishCard({ dish }: { dish: TravelDishDto }) {
  const { t } = useTranslation();
  const { cautionFor } = useMyAllergies();
  const availability = dishAvailability(dish);
  return (
    <Link
      to={routes.dish(dish.id)}
      className="group flex flex-col gap-1.5 rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <ImageFrame
        src={dish.coverImageUrl}
        alt={dish.name}
        caution={cautionFor(dish.allergens)}
      />
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
      <CuisineChips cuisines={dish.cuisines} />
    </Link>
  );
}

export default DishCard;
