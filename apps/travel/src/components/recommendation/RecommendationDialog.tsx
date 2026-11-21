import type { TravelRecommendationDto } from '@hatohui/models';
import type { useDialogState } from '../../hooks/useDialogState';
import FormDialog from '../shared/FormDialog';
import RecommendationForm from './RecommendationForm';

interface Props {
  state: ReturnType<typeof useDialogState>;
  recommendation?: TravelRecommendationDto;
}

function RecommendationDialog({ state, recommendation }: Props) {
  return (
    <FormDialog open={state.open} onOpenChange={state.setOpen} wide>
      <RecommendationForm
        recommendation={recommendation}
        onClose={state.close}
      />
    </FormDialog>
  );
}

export default RecommendationDialog;
