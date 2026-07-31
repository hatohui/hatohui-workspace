import { useTranslation } from '@hatohui/i18n';
import { Dialog, DialogContent, DialogTitle } from '@hatohui/ui';
import LanguageOptionsList from './LanguageOptionsList';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function SettingsDialog({ open, onOpenChange }: Props) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogTitle>{t('settings.title')}</DialogTitle>
        <div className="flex flex-col gap-5">
          <section className="flex flex-col gap-1.5">
            <h3 className="text-sm font-medium">{t('settings.language')}</h3>
            <LanguageOptionsList />
          </section>
          <section className="flex flex-col gap-1.5 border-t border-border pt-4">
            <h3 className="text-sm font-medium">
              {t('settings.general.title')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('settings.general.stub')}
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SettingsDialog;
