import LanguageSettingsSection from './LanguageSettingsSection';
import NotificationSettingsSection from './NotificationSettingsSection';
import TimezoneSettingsSection from './TimezoneSettingsSection';
import ThemeSettingsSection from './ThemeSettingsSection';

function SettingsView() {
  return (
    <div className="flex max-w-md flex-col gap-8">
      <NotificationSettingsSection />
      <TimezoneSettingsSection />
      <ThemeSettingsSection />
      <LanguageSettingsSection />
    </div>
  );
}

export default SettingsView;
