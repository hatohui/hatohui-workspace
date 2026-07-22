import { Link } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import routes from '../constants/routes';

function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="text-3xl">{t('notFound.title')}</h1>
      <Button asChild variant="outline">
        <Link to={routes.dashboard}>{t('notFound.backToDashboard')}</Link>
      </Button>
    </div>
  );
}

export default NotFoundPage;
