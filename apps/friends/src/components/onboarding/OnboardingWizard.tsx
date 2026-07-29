import { useTranslation } from '@hatohui/i18n';
import { Button, DialogTitle } from '@hatohui/ui';
import { useOnboardingWizard } from '../../hooks/useOnboardingWizard';
import OnboardingOptInStep from './OnboardingOptInStep';
import OnboardingVisibilityStep from './OnboardingVisibilityStep';
import OnboardingBirthdayStep from './OnboardingBirthdayStep';
import OnboardingConnectionsStep from './OnboardingConnectionsStep';
import OnboardingCompleteStep from './OnboardingCompleteStep';

function OnboardingWizard() {
  const { t } = useTranslation();
  const wizard = useOnboardingWizard();

  if (wizard.isLoading) {
    return <p>{t('common:loading')}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <DialogTitle className="text-2xl">{t('onboarding.title')}</DialogTitle>
        {wizard.step !== 'complete' && (
          <Button variant="ghost" size="sm" onClick={wizard.submitSkip}>
            {t('onboarding.skip')}
          </Button>
        )}
      </div>

      {wizard.step === 'optIn' && (
        <OnboardingOptInStep submitting={false} onAnswer={wizard.submitOptIn} />
      )}
      {wizard.step === 'visibility' && (
        <OnboardingVisibilityStep
          initialVisibility="PUBLIC"
          submitting={false}
          onSubmit={wizard.submitVisibility}
        />
      )}
      {wizard.step === 'birthday' && (
        <OnboardingBirthdayStep
          submitting={false}
          onSubmit={wizard.submitBirthday}
        />
      )}
      {wizard.step === 'connections' && (
        <OnboardingConnectionsStep
          submitting={false}
          onSubmit={wizard.submitConnections}
        />
      )}
      {wizard.step === 'complete' && (
        <OnboardingCompleteStep
          submitting={false}
          onFinish={wizard.submitComplete}
        />
      )}
    </div>
  );
}

export default OnboardingWizard;
