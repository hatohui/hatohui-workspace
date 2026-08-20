import { useTranslation } from '@hatohui/i18n';

function SettingsPage() {
  const { t } = useTranslation('workspace');

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{t('settings.title')}</h1>
      <p className="text-sm text-muted-foreground">
        {t('settings.placeholder')}
      </p>
    </div>
  );
}

export default SettingsPage;
