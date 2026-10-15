import { useTranslation } from '@hatohui/i18n';
import { GoogleLoginButton } from '@hatohui/libs';

function WelcomeHero() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8 text-center">
      <div className="h-64 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-soft">
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
      <GoogleLoginButton />
    </div>
  );
}

export default WelcomeHero;
