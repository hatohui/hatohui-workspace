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
            <h3 className="font-sans text-sm font-medium">
              {t('settings.language')}
            </h3>
            <LanguageOptionsList />
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SettingsDialog;
