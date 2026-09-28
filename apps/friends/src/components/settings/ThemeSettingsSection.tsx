import { useTranslation } from '@hatohui/i18n';
import { ThemeSelect } from '@hatohui/libs';

function ThemeSettingsSection() {
  const { t } = useTranslation('common');

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-sans text-sm font-medium">{t('theme.label')}</h2>
      <ThemeSelect className="max-w-xs" />
    </section>
  );
}

export default ThemeSettingsSection;
