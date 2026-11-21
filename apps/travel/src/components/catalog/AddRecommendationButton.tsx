import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import { Plus } from 'lucide-react';
import { useCanEdit } from '../../hooks/useCanEdit';
import { useDialogState } from '../../hooks/useDialogState';
import RecommendationDialog from '../recommendation/RecommendationDialog';

function AddRecommendationButton() {
  const { t } = useTranslation();
  const canEdit = useCanEdit();
  const dialog = useDialogState();
  if (!canEdit) return null;

  return (
    <>
      <Button className="rounded-full" onClick={dialog.show}>
        <Plus />
        {t('catalog.add')}
      </Button>
      <RecommendationDialog key={dialog.version} state={dialog} />
    </>
  );
}

export default AddRecommendationButton;
