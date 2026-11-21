import { useTranslation } from '@hatohui/i18n';
import type { TravelRecommendationDto } from '@hatohui/models';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@hatohui/ui';
import type { useDialogState } from '../../hooks/useDialogState';
import RecommendationForm from './RecommendationForm';

interface Props {
  state: ReturnType<typeof useDialogState>;
  recommendation?: TravelRecommendationDto;
}

function RecommendationDialog({ state, recommendation }: Props) {
  const { t } = useTranslation();
  return (
    <Dialog open={state.open} onOpenChange={state.setOpen}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl lg:max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {t(recommendation ? 'form.editTitle' : 'form.createTitle')}
          </DialogTitle>
        </DialogHeader>
        <RecommendationForm
          recommendation={recommendation}
          onClose={state.close}
        />
      </DialogContent>
    </Dialog>
  );
}

export default RecommendationDialog;
