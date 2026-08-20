import { useTranslation } from '@hatohui/i18n';

function DashboardPage() {
  const { t } = useTranslation('workspace');
  return <h1 className="text-xl font-semibold">{t('dashboard.title')}</h1>;
}

export default DashboardPage;
