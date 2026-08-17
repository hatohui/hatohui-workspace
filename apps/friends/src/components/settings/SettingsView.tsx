import LanguageSettingsSection from './LanguageSettingsSection';
import NotificationSettingsSection from './NotificationSettingsSection';
import TimezoneSettingsSection from './TimezoneSettingsSection';

function SettingsView() {
  return (
    <div className="flex max-w-md flex-col gap-8">
      <NotificationSettingsSection />
      <TimezoneSettingsSection />
      <LanguageSettingsSection />
    </div>
  );
}

export default SettingsView;
