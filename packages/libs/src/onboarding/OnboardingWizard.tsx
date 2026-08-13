import { useTranslation } from '@hatohui/i18n';
import { Button, DialogTitle, LoadingDots } from '@hatohui/ui';
import { useAuth } from '../auth/AuthContext';
import { useOnboardingWizard } from './useOnboardingWizard';
import type { OnboardingMode } from './onboardingStep';
import OnboardingOptInStep from './OnboardingOptInStep';
import OnboardingProfileStep from './OnboardingProfileStep';
import OnboardingHandleStep from './OnboardingHandleStep';
import OnboardingVisibilityStep from './OnboardingVisibilityStep';
import OnboardingBirthdayStep from './OnboardingBirthdayStep';
import OnboardingConnectionsStep from './OnboardingConnectionsStep';
import OnboardingCompleteStep from './OnboardingCompleteStep';

type Props = {
  mode?: OnboardingMode;
  onEntityChanged?: () => void;
};

function OnboardingWizard({ mode = 'full', onEntityChanged }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const wizard = useOnboardingWizard(mode, onEntityChanged);

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
        <DialogTitle className="text-2xl">
          {t('common:onboarding.title')}
        </DialogTitle>
        {wizard.step !== 'complete' && (
          <Button variant="ghost" size="sm" onClick={wizard.submitSkip}>
            {t('common:onboarding.skip')}
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
      {wizard.step === 'handle' && user && (
        <OnboardingHandleStep
          initialHandle={user.handle ?? ''}
          submitting={wizard.isSubmittingHandle}
          error={wizard.handleError}
          onSubmit={wizard.submitHandle}
          onSkip={() => wizard.submitHandle(undefined)}
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
