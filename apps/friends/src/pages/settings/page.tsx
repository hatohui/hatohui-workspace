import { useTranslation } from '@hatohui/i18n';
import RequireAuth from '../../components/auth/RequireAuth';
import SettingsView from '../../components/settings/SettingsView';

function SettingsPage() {
  const { t } = useTranslation();

  return (
    <RequireAuth>
      <h1 className="mb-6 text-3xl">{t('settings.title')}</h1>
      <SettingsView />
    </RequireAuth>
  );
}

export default SettingsPage;
