import type { ReactNode } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { GoogleLoginButton, useAuth } from '@hatohui/libs';
import { Spinner } from '@hatohui/ui';
import { useAdminKey } from '../../hooks/useAdminKey';
import AdminKeyForm from './AdminKeyForm';

function AdminGate({ children }: { children: ReactNode }) {
  const { t } = useTranslation('workspace');
  const { user, isLoading } = useAuth();
  const { key } = useAdminKey();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <GoogleLoginButton />
      </div>
    );
  }

  if (!user.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        {t('adminGate.notAdmin')}
      </div>
    );
  }

  if (!key) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <AdminKeyForm />
      </div>
    );
  }

  return <>{children}</>;
}

export default AdminGate;
