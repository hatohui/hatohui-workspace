import { useTranslation } from '@hatohui/i18n';
import { Spinner } from '@hatohui/ui';
import { useAdminSystemParameters } from '../../hooks/useAdminSystemParameters';
import SystemParametersTable from '../../components/system-parameters/SystemParametersTable';

function SystemParametersPage() {
  const { t } = useTranslation('workspace');
  const { rows, isLoading, updateValue, createParameter } =
    useAdminSystemParameters();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{t('systemParameters.title')}</h1>
      {isLoading ? (
        <Spinner />
      ) : (
        <SystemParametersTable
          rows={rows}
          onCommit={updateValue}
          onCreate={createParameter}
        />
      )}
    </div>
  );
}

export default SystemParametersPage;
