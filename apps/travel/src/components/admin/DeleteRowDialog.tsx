import { useTranslation } from '@hatohui/i18n';
import { ConfirmDialog } from '@hatohui/ui';

interface Props {
  name: string | null;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteRowDialog({ name, description, onConfirm, onCancel }: Props) {
  const { t } = useTranslation();
  return (
    <ConfirmDialog
      open={name !== null}
      title={t('admin.deleteTitle', { name: name ?? '' })}
      description={description}
      cancelLabel={t('form.cancel')}
      confirmLabel={t('recommendation.delete')}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}

export default DeleteRowDialog;
