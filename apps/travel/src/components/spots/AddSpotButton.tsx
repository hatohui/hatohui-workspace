import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import { Plus } from 'lucide-react';
import { useCanEdit } from '../../hooks/useCanEdit';
import { useDialogState } from '../../hooks/useDialogState';
import SpotDialog from './SpotDialog';

function AddSpotButton() {
  const { t } = useTranslation();
  const canEdit = useCanEdit();
  const dialog = useDialogState();
  if (!canEdit) return null;

  return (
    <>
      <Button
        size="sm"
        className="h-9 shrink-0 rounded-full text-xs sm:h-8"
        onClick={dialog.show}
      >
        <Plus />
        {t('spots.add')}
      </Button>
      <SpotDialog key={dialog.version} state={dialog} />
    </>
  );
}

export default AddSpotButton;
