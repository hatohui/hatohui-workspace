import { useTranslation } from '@hatohui/i18n';
import LanguageOptionsList from './LanguageOptionsList';

function LanguageSettingsSection() {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="font-sans text-sm font-medium">
          {t('settings.language')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('settings.languageDescription')}
        </p>
      </div>
      <LanguageOptionsList />
    </section>
  );
}

export default LanguageSettingsSection;
