import { Link } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import type { TravelDishDto } from '@hatohui/models';
import routes from '../../constants/routes';
import CuisineChips from '../shared/CuisineChips';
import ImageFrame from '../shared/ImageFrame';

function DishCard({ dish }: { dish: TravelDishDto }) {
  const { t } = useTranslation();
  return (
    <Link
      to={routes.dish(dish.id)}
      className="group flex flex-col gap-2 rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <ImageFrame src={dish.coverImageUrl} alt={dish.name} />
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="truncate text-lg font-medium tracking-tight group-hover:underline">
          {dish.name}
        </h2>
        <span className="shrink-0 text-sm text-muted-foreground">
          {t('dishes.placeCount', { count: dish.placeCount })}
        </span>
      </div>
      <CuisineChips cuisines={dish.cuisines} />
    </Link>
  );
}

export default DishCard;
