import { useTranslation } from '@hatohui/i18n';
import {
  deleteTravelRecommendation,
  type TravelRecommendationDto,
} from '@hatohui/models';
import { Button, ConfirmDialog } from '@hatohui/ui';
import { Pencil, Trash2 } from 'lucide-react';
import { useCanEdit } from '../../hooks/useCanEdit';
import { useConfirmedDelete } from '../../hooks/useConfirmedDelete';
import { useDialogState } from '../../hooks/useDialogState';
import RecommendationDialog from './RecommendationDialog';

interface Props {
  recommendation: TravelRecommendationDto;
}

function RecommendationActions({ recommendation: rec }: Props) {
  const { t } = useTranslation();
  const canEdit = useCanEdit();
  const editor = useDialogState();
  const deletion = useConfirmedDelete(() => deleteTravelRecommendation(rec.id));
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
      <Button
        variant="ghost"
        size="icon"
        aria-label={t('recommendation.delete')}
        onClick={deletion.request}
      >
        <Trash2 />
      </Button>
      <RecommendationDialog
        key={editor.version}
        state={editor}
        recommendation={rec}
      />
      <ConfirmDialog
        open={deletion.open}
        title={t('recommendation.deleteTitle')}
        description={t('recommendation.deleteDescription', {
          dish: rec.dish.name,
          place: rec.place.name,
        })}
        cancelLabel={t('form.cancel')}
        confirmLabel={t('recommendation.delete')}
        onCancel={() => deletion.setOpen(false)}
        onConfirm={() => void deletion.confirm()}
      />
    </div>
  );
}

export default RecommendationActions;
