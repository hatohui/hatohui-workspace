import { Link } from 'react-router';
import type { TravelRecommendationDto } from '@hatohui/models';
import routes from '../../constants/routes';
import PlaceMap from '../maps/PlaceMap';
import PlaceMapsChip from '../maps/PlaceMapsChip';
import CreatorBadge from '../shared/CreatorBadge';
import CuisineChips from '../shared/CuisineChips';
import AllergenNote from './AllergenNote';
import PhotoCarousel from './PhotoCarousel';
import RecommendationActions from './RecommendationActions';
import RecommendationTags from './RecommendationTags';

interface Props {
  recommendation: TravelRecommendationDto;
}

function RecommendationDetails({ recommendation: rec }: Props) {
  return (
    <div className="space-y-4">
      <PhotoCarousel
        images={rec.images}
        alt={`${rec.dish.name}, ${rec.place.name}`}
      />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-2">
          <Link
            to={routes.dish(rec.dish.id)}
            className="block text-xl font-medium tracking-tight hover:underline"
          >
            {rec.dish.name}
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <PlaceMapsChip place={rec.place} />
            {rec.place.area && (
              <span className="inline-flex items-center rounded-full border border-border/70 px-2.5 py-0.5 text-xs text-muted-foreground">
                {rec.place.area.name}
              </span>
            )}
          </div>
        </div>
        <RecommendationActions recommendation={rec} />
      </div>
      <CuisineChips cuisines={rec.dish.cuisines} />
      <RecommendationTags tags={rec} />
      <AllergenNote allergens={rec.allergens} />
      {rec.note && (
        <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
          {rec.note}
        </p>
      )}
      <PlaceMap place={rec.place} />
      <CreatorBadge creator={rec.createdBy} />
    </div>
  );
}

export default RecommendationDetails;
