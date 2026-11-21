import { Link } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import routes from '../constants/routes';

function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-3 py-24 text-center">
      <h1 className="text-2xl font-medium tracking-tight">
        {t('notFound.title')}
      </h1>
      <Link
        to={routes.catalog}
        className="text-sm text-primary hover:underline"
      >
        {t('notFound.back')}
      </Link>
    </div>
  );
}

export default NotFoundPage;
