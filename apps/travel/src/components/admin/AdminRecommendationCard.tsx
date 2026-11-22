import type { TravelRecommendationDto } from '@hatohui/models';
import { useDialogState } from '../../hooks/useDialogState';
import DeleteRecommendationButton from '../recommendation/DeleteRecommendationButton';
import FoodCard from '../recommendation/FoodCard';
import RecommendationDialog from '../recommendation/RecommendationDialog';

interface Props {
  recommendation: TravelRecommendationDto;
}

function AdminRecommendationCard({ recommendation }: Props) {
  const editor = useDialogState();

  return (
    <div className="relative">
      <FoodCard
        recommendation={recommendation}
        labelMode="both"
        onOpen={editor.show}
      />
      <DeleteRecommendationButton
        recommendation={recommendation}
        className="absolute top-2 right-2 size-8 rounded-full bg-background/85 shadow-sm backdrop-blur-sm hover:bg-background"
      />
      <RecommendationDialog
        key={editor.version}
        state={editor}
        recommendation={recommendation}
      />
    </div>
  );
}

export default AdminRecommendationCard;
