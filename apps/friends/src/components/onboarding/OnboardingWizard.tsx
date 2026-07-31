import { useTranslation } from '@hatohui/i18n';
import { Button, DialogTitle, LoadingDots } from '@hatohui/ui';
import { useAuth } from '@hatohui/libs';
import { useOnboardingWizard } from '../../hooks/useOnboardingWizard';
import OnboardingOptInStep from './OnboardingOptInStep';
import OnboardingProfileStep from './OnboardingProfileStep';
import OnboardingVisibilityStep from './OnboardingVisibilityStep';
import OnboardingBirthdayStep from './OnboardingBirthdayStep';
import OnboardingConnectionsStep from './OnboardingConnectionsStep';
import OnboardingCompleteStep from './OnboardingCompleteStep';

function OnboardingWizard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const wizard = useOnboardingWizard();

  if (wizard.isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingDots label={t('common:loading')} />
      </div>
    );
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
      {wizard.step === 'profile' && user && (
        <OnboardingProfileStep
          initialName={wizard.entry?.name ?? user.name}
          initialAvatarUrl={wizard.entry?.avatarUrl ?? user.avatarUrl}
          submitting={false}
          onSubmit={wizard.submitProfile}
        />
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
