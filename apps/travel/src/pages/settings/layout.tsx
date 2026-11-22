import { Outlet } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import { useAuth } from '@hatohui/libs';
import { Settings } from 'lucide-react';
import SettingsNav from '../../components/settings/SettingsNav';
import EmptyState from '../../components/shared/EmptyState';

function SettingsLayout() {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();

  if (!isLoading && !user) {
    return <EmptyState icon={Settings} message={t('settings.signInPrompt')} />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        {t('settings.title')}
      </h1>
      <SettingsNav />
      <Outlet />
    </div>
  );
}

export default SettingsLayout;
