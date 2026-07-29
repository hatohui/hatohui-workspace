import { useTranslation } from '@hatohui/i18n';
import { GoogleLoginButton } from '@hatohui/libs';

function WelcomeHero() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-8 py-12 text-center">
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
      <GoogleLoginButton />
    </div>
  );
}

export default WelcomeHero;
