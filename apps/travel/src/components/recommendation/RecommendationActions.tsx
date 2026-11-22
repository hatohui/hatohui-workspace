import { useTranslation } from '@hatohui/i18n';
import type { TravelRecommendationDto } from '@hatohui/models';
import { Button } from '@hatohui/ui';
import { Pencil } from 'lucide-react';
import { useCanEdit } from '../../hooks/useCanEdit';
import { useDialogState } from '../../hooks/useDialogState';
import DeleteRecommendationButton from './DeleteRecommendationButton';
import RecommendationDialog from './RecommendationDialog';

interface Props {
  recommendation: TravelRecommendationDto;
}

function RecommendationActions({ recommendation: rec }: Props) {
  const { t } = useTranslation();
  const canEdit = useCanEdit();
  const editor = useDialogState();
  if (!canEdit) return null;

  return (
    <div className="flex shrink-0 gap-1">
      <Button
        variant="ghost"
        size="icon"
        aria-label={t('recommendation.edit')}
        onClick={editor.show}
      >
        <Pencil />
      </Button>
      <DeleteRecommendationButton recommendation={rec} />
      <RecommendationDialog
        key={editor.version}
        state={editor}
        recommendation={rec}
      />
    </div>
  );
}

export default RecommendationActions;
