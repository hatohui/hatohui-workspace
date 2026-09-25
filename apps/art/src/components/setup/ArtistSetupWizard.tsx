'use client';

import { useTranslation } from '@hatohui/i18n';
import { Button, Skeleton } from '@hatohui/ui';
import { useArtistSetupWizard } from '@/hooks/useArtistSetupWizard';
import { SetupStepper } from './SetupStepper';
import { SetupStepContent } from './SetupStepContent';

export function ArtistSetupWizard() {
  const { t } = useTranslation('art');
  const wizard = useArtistSetupWizard();

  if (wizard.isLoading) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {t('app.setup.progress', {
              current: wizard.index + 1,
              total: wizard.total,
            })}
          </p>
          <h1 className="font-serif text-3xl">
            {t(`app.setup.steps.${wizard.step}.title`)}
          </h1>
          <p className="max-w-xl text-muted-foreground">
            {t(`app.setup.steps.${wizard.step}.description`)}
          </p>
        </div>
        <Button variant="ghost" onClick={wizard.skip}>
          {t('app.setup.skip')}
        </Button>
      </header>

      <SetupStepper steps={wizard.steps} onSelect={wizard.goTo} />

      <SetupStepContent wizard={wizard} />

      {!wizard.isLast && (
        <div className="flex justify-between gap-2 border-t border-border pt-6">
          <Button
            variant="outline"
            disabled={!wizard.canGoBack}
            onClick={wizard.back}
          >
            {t('app.setup.back')}
          </Button>
          <Button onClick={wizard.next}>{t('app.setup.continue')}</Button>
        </div>
      )}
    </div>
  );
}
