import { useTranslation } from '@hatohui/i18n';
import { Spinner } from '@hatohui/ui';
import { useAdminSystemParameters } from '../../hooks/useAdminSystemParameters';
import SystemParametersTable from '../../components/settings/SystemParametersTable';

function SettingsPage() {
  const { t } = useTranslation('workspace');
  const { rows, isLoading, updateValue } = useAdminSystemParameters();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{t('settings.title')}</h1>
      {isLoading ? (
        <Spinner />
      ) : (
        <SystemParametersTable rows={rows} onCommit={updateValue} />
      )}
    </div>
  );
}

export default SettingsPage;
