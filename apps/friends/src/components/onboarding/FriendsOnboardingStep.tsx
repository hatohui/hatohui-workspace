import type { OnboardingStep } from '@hatohui/libs';
import { useFriendsOnboarding } from '../../hooks/useFriendsOnboarding';
import OnboardingVisibilityStep from './OnboardingVisibilityStep';
import OnboardingBirthdayStep from './OnboardingBirthdayStep';
import OnboardingTimezoneStep from './OnboardingTimezoneStep';
import OnboardingConnectionsStep from './OnboardingConnectionsStep';

type Props = {
  step: OnboardingStep;
  goTo: (next: OnboardingStep) => void;
  onEntityChanged: () => void;
};

function FriendsOnboardingStep({ step, goTo, onEntityChanged }: Props) {
  const onboarding = useFriendsOnboarding(goTo, onEntityChanged);

  return (
    <>
      {step === 'visibility' && (
        <OnboardingVisibilityStep
          initialVisibility="PUBLIC"
          submitting={false}
          onSubmit={onboarding.submitVisibility}
        />
      )}
      {step === 'birthday' && (
        <OnboardingBirthdayStep
          submitting={false}
          onSubmit={onboarding.submitBirthday}
        />
      )}
      {step === 'timezone' && (
        <OnboardingTimezoneStep
          initialTimezone={onboarding.initialTimezone}
          submitting={onboarding.isSubmittingTimezone}
          onSubmit={onboarding.submitTimezone}
        />
      )}
      {step === 'connections' && (
        <OnboardingConnectionsStep
          submitting={false}
          onSubmit={onboarding.submitConnections}
        />
      )}
    </>
  );
}

export default FriendsOnboardingStep;
