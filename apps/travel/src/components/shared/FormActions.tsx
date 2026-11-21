import { useTranslation } from '@hatohui/i18n';
import { Button, Spinner } from '@hatohui/ui';

interface Props {
  canSubmit: boolean;
  isSaving: boolean;
  onCancel: () => void;
}

function FormActions({ canSubmit, isSaving, onCancel }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex shrink-0 justify-end gap-2 border-t border-border/60 px-6 py-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        {t('form.cancel')}
      </Button>
      <Button type="submit" disabled={!canSubmit || isSaving}>
        {isSaving && <Spinner />}
        {t(isSaving ? 'form.saving' : 'form.save')}
      </Button>
    </div>
  );
}

export default FormActions;
