import LanguageSettingsSection from './LanguageSettingsSection';
import NotificationSettingsSection from './NotificationSettingsSection';

function SettingsView() {
  return (
    <div className="flex max-w-md flex-col gap-8">
      <NotificationSettingsSection />
      <LanguageSettingsSection />
    </div>
  );
}

export default SettingsView;
