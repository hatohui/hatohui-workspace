import { useTranslation } from '@hatohui/i18n';
import { Label, SearchableSelect } from '@hatohui/ui';
import { useTimezone } from '../../hooks/useTimezone';

function TimezoneSettingsSection() {
  const { t } = useTranslation();
  const { timezone, options, isReady, setTimezone } = useTimezone();

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="font-sans text-sm font-medium">
          {t('settings.timezone.title')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('settings.timezone.description')}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="timezone-select">{t('settings.timezone.label')}</Label>
        <SearchableSelect
          id="timezone-select"
          value={timezone}
          options={options}
          placeholder={t('settings.timezone.placeholder')}
          searchPlaceholder={t('settings.timezone.searchPlaceholder')}
          emptyLabel={t('settings.timezone.emptyLabel')}
          onChange={setTimezone}
          className={!isReady ? 'pointer-events-none opacity-50' : undefined}
        />
      </div>
    </section>
  );
}

export default TimezoneSettingsSection;
