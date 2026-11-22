import type { TravelRecommendationDto } from '@hatohui/models';
import type { useDialogState } from '../../hooks/useDialogState';
import FormDialog from '../shared/FormDialog';
import RecommendationForm from './RecommendationForm';

interface Props {
  state: ReturnType<typeof useDialogState>;
  recommendation?: TravelRecommendationDto;
  initialDishName?: string;
}

function RecommendationDialog({
  state,
  recommendation,
  initialDishName,
}: Props) {
  return (
    <FormDialog open={state.open} onOpenChange={state.setOpen} wide>
      <RecommendationForm
        recommendation={recommendation}
        initialDishName={initialDishName}
        onClose={state.close}
      />
    </FormDialog>
  );
}

export default RecommendationDialog;
