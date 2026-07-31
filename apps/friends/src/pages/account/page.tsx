import { useTranslation } from '@hatohui/i18n';
import RequireAuth from '../../components/RequireAuth';
import AccountView from '../../components/AccountView';

function AccountPage() {
  const { t } = useTranslation();

  return (
    <RequireAuth>
      <h1 className="mb-6 text-3xl">{t('account.title')}</h1>
      <AccountView />
    </RequireAuth>
  );
}

export default AccountPage;
