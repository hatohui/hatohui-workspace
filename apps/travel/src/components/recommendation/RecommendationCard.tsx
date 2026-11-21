import { Link } from 'react-router';
import type { TravelRecommendationDto } from '@hatohui/models';
import { MapPin } from 'lucide-react';
import routes from '../../constants/routes';
import CreatorBadge from '../shared/CreatorBadge';
import EstimateLabel from './EstimateLabel';
import PhotoCarousel from './PhotoCarousel';
import RecommendationActions from './RecommendationActions';
import RecommendationFlags from './RecommendationFlags';

interface Props {
  recommendation: TravelRecommendationDto;
}

function RecommendationCard({ recommendation: rec }: Props) {
  return (
    <article className="flex flex-col gap-3">
      <PhotoCarousel
        images={rec.images}
        alt={`${rec.dish.name}, ${rec.place.name}`}
      />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-1.5">
          <h2 className="flex items-center gap-2 text-lg font-medium tracking-tight">
            <Link
              to={routes.dish(rec.dish.id)}
              className="truncate hover:underline"
            >
              {rec.dish.name}
            </Link>
            <RecommendationFlags
              spicy={rec.spicy}
              vegetarian={rec.vegetarian}
            />
          </h2>
          <Link
            to={routes.place(rec.place.id)}
            className="inline-flex max-w-full items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-sm hover:bg-card-hover"
          >
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{rec.place.name}</span>
          </Link>
        </div>
        <RecommendationActions recommendation={rec} />
      </div>
      <EstimateLabel estimate={rec.estimate} currency={rec.currency} />
      {rec.note && (
        <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
          {rec.note}
        </p>
      )}
      <CreatorBadge creator={rec.createdBy} />
    </article>
  );
}

export default RecommendationCard;
