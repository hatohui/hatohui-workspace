import { useTranslation } from '@hatohui/i18n';
import { Button, Spinner } from '@hatohui/ui';
import { useModifierKeyLabel } from '../../hooks/useModifierKeyLabel';

interface Props {
  canSubmit: boolean;
  isSaving: boolean;
  onCancel: () => void;
}

function FormActions({ canSubmit, isSaving, onCancel }: Props) {
  const { t } = useTranslation();
  const modifier = useModifierKeyLabel();
  return (
    <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border/60 px-6 py-4">
      <p className="mr-auto hidden text-xs text-muted-foreground sm:block">
        {t('form.saveShortcut', { modifier })}
      </p>
      <Button type="button" variant="outline" onClick={onCancel}>
        {t('form.cancel')}
      </Button>
      <Button type="submit" disabled={!canSubmit || isSaving}>
        {isSaving && <Spinner className="text-current" />}
        {t(isSaving ? 'form.saving' : 'form.save')}
      </Button>
    </div>
  );
}

export default FormActions;
