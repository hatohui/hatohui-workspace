import { useTranslation } from '@hatohui/i18n';
import { Button, ConfirmDialog } from '@hatohui/ui';
import { Pencil, Trash2 } from 'lucide-react';
import type { useConfirmedDelete } from '../../hooks/useConfirmedDelete';
import { useCanEdit } from '../../hooks/useCanEdit';

interface Props {
  onEdit: () => void;
  deletion: ReturnType<typeof useConfirmedDelete>;
  deleteTitle: string;
  deleteDescription: string;
}

function EntityActions(props: Props) {
  const { t } = useTranslation();
  const canEdit = useCanEdit();
  if (!canEdit) return null;

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={props.onEdit}>
        <Pencil />
        {t('recommendation.edit')}
      </Button>
      <Button variant="outline" size="sm" onClick={props.deletion.request}>
        <Trash2 />
        {t('recommendation.delete')}
      </Button>
      <ConfirmDialog
        open={props.deletion.open}
        title={props.deleteTitle}
        description={props.deleteDescription}
        cancelLabel={t('form.cancel')}
        confirmLabel={t('recommendation.delete')}
        onCancel={() => props.deletion.setOpen(false)}
        onConfirm={() => void props.deletion.confirm()}
      />
    </div>
  );
}

export default EntityActions;
