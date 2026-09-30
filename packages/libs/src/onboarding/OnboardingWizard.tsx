import { useTranslation } from '@hatohui/i18n';
import { Button, DialogTitle, LoadingDots } from '@hatohui/ui';
import { useAuth } from '../auth/AuthContext';
import { useOnboardingWizard } from './useOnboardingWizard';
import {
  isCoreOnboardingStep,
  type OnboardingStep,
  type RenderOnboardingStep,
} from './onboardingStep';
import OnboardingOptInStep from './OnboardingOptInStep';
import OnboardingProfileStep from './OnboardingProfileStep';
import OnboardingHandleStep from './OnboardingHandleStep';
import OnboardingCompleteStep from './OnboardingCompleteStep';
import OnboardingLanguageSwitcher from './OnboardingLanguageSwitcher';

export type OnboardingWizardProps = {
  afterHandle?: OnboardingStep;
  renderStep?: RenderOnboardingStep;
  onEntityChanged?: () => void;
};

function OnboardingWizard({
  afterHandle,
  renderStep,
  onEntityChanged,
}: OnboardingWizardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const wizard = useOnboardingWizard({ afterHandle, onEntityChanged });

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
        <div className="flex items-center gap-1">
          <OnboardingLanguageSwitcher />
          {wizard.step !== 'complete' && (
            <Button variant="ghost" size="sm" onClick={wizard.submitSkip}>
              {t('common:onboarding.skip')}
            </Button>
          )}
        </div>
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
      {!isCoreOnboardingStep(wizard.step) &&
        renderStep?.(wizard.step, wizard.goTo)}
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
