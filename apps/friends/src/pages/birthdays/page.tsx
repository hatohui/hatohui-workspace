import { Cake } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import RequireAuth from '../../components/auth/RequireAuth';
import BirthdayDirectory from '../../components/birthdays/BirthdayDirectory';

function BirthdaysPage() {
  const { t } = useTranslation();

  return (
    <RequireAuth>
      <BirthdayDirectory
        header={
          <h1 className="mb-6 flex items-center gap-2 text-3xl">
            <Cake className="size-7 shrink-0" />
            {t('dashboard.title')}
          </h1>
        }
        emptyMessage={t('birthdays.empty')}
      />
    </RequireAuth>
  );
}

export default BirthdaysPage;
