import type { TravelRecommendationDto } from '@hatohui/models';
import ImageFrame from '../shared/ImageFrame';

interface Props {
  recommendation: TravelRecommendationDto;
  onOpen: () => void;
}

function FoodCard({ recommendation: rec, onOpen }: Props) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex cursor-pointer flex-col gap-2 rounded-xl text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <ImageFrame
        src={
          rec.images[0]?.thumbnailUrl ??
          rec.images[0]?.url ??
          rec.dish.thumbnailUrl ??
          rec.dish.imageUrl ??
          null
        }
        alt={rec.dish.name}
        square
      />
      <span className="line-clamp-2 font-medium tracking-tight group-hover:underline">
        {rec.dish.name}
      </span>
    </button>
  );
}

export default FoodCard;
