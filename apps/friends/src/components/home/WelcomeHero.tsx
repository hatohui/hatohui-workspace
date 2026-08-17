import { Cake } from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import { GoogleLoginButton } from '@hatohui/libs';
import { Button } from '@hatohui/ui';
import routes from '../../constants/routes';

function WelcomeHero() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8 text-center">
      <div className="h-64 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_3px_rgba(20,20,19,0.08)]">
        <img
          src="/favicon.png"
          alt="A cozy dragon mascot"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl">{t('welcome.title')}</h1>
        <p className="max-w-sm text-muted-foreground">
          {t('welcome.subtitle')}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <GoogleLoginButton />
        <Button asChild variant="outline">
          <Link to={routes.birthdays} className="flex items-center gap-2">
            <Cake className="size-4 shrink-0" />
            {t('welcome.birthdaysCta')}
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default WelcomeHero;
