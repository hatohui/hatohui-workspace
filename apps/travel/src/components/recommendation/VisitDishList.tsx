import { Link } from 'react-router';
import type { TravelRecommendationDto } from '@hatohui/models';
import routes from '../../constants/routes';
import CuisineChips from '../shared/CuisineChips';
import AllergenNote from './AllergenNote';
import PriceLabel from './PriceLabel';

interface Props {
  recommendation: TravelRecommendationDto;
}

function VisitDishList({ recommendation: rec }: Props) {
  return (
    <ul className="divide-y divide-border/60 rounded-xl border border-border/60">
      {rec.dishes.map((line) => (
        <li key={line.id} className="space-y-1.5 px-3 py-2.5">
          <div className="flex items-baseline justify-between gap-3">
            <Link
              to={routes.dish(line.dish.id)}
              className="min-w-0 truncate font-medium hover:underline"
            >
              {line.dish.name}
            </Link>
            <PriceLabel price={{ ...line, currency: rec.currency }} />
          </div>
          <CuisineChips cuisines={line.dish.cuisines} />
          <AllergenNote allergens={line.allergens} />
        </li>
      ))}
    </ul>
  );
}

export default VisitDishList;
