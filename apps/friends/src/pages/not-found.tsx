import { Link } from 'react-router';
import { Compass, Home } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import routes from '../constants/routes';

function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center">
      <div className="flex size-20 items-center justify-center rounded-full border border-border bg-card">
        <Compass className="size-9 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl">{t('notFound.title')}</h1>
        <p className="max-w-sm text-muted-foreground">
          {t('notFound.subtitle')}
        </p>
      </div>
      <Button asChild>
        <Link to={routes.dashboard} className="flex items-center gap-2">
          <Home className="size-4 shrink-0" />
          {t('notFound.backToDashboard')}
        </Link>
      </Button>
    </div>
  );
}

export default NotFoundPage;
