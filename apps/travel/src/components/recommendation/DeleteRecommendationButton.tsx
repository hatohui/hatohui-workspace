import { useTranslation } from '@hatohui/i18n';
import {
  deleteTravelRecommendation,
  type TravelRecommendationDto,
} from '@hatohui/models';
import { Button, ConfirmDialog, cn } from '@hatohui/ui';
import { Trash2 } from 'lucide-react';
import { useConfirmedDelete } from '../../hooks/useConfirmedDelete';
import { recommendationDishNames } from '../../lib/recommendationView';

interface Props {
  recommendation: TravelRecommendationDto;
  className?: string;
}

function DeleteRecommendationButton({ recommendation: rec, className }: Props) {
  const { t } = useTranslation();
  const deletion = useConfirmedDelete(() => deleteTravelRecommendation(rec.id));

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label={t('recommendation.delete')}
        onClick={deletion.request}
        className={cn(className)}
      >
        <Trash2 />
      </Button>
      <ConfirmDialog
        open={deletion.open}
        title={t('recommendation.deleteTitle')}
        description={t('recommendation.deleteDescription', {
          dish: recommendationDishNames(rec),
          place: rec.place.name,
        })}
        cancelLabel={t('form.cancel')}
        confirmLabel={t('recommendation.delete')}
        onCancel={() => deletion.setOpen(false)}
        onConfirm={() => void deletion.confirm()}
      />
    </>
  );
}

export default DeleteRecommendationButton;
