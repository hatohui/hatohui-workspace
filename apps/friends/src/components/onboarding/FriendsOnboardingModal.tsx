import { useQueryClient } from '@tanstack/react-query';
import { OnboardingModal } from '@hatohui/libs';
import { invalidateFriendQueries } from '../../hooks/friendQueryClient';
import { FRIENDS_ONBOARDING_FIRST_STEP } from '../../constants/onboarding';
import FriendsOnboardingStep from './FriendsOnboardingStep';

function FriendsOnboardingModal() {
  const client = useQueryClient();
  const onEntityChanged = () => void invalidateFriendQueries(client);

  return (
    <OnboardingModal
      afterHandle={FRIENDS_ONBOARDING_FIRST_STEP}
      onEntityChanged={onEntityChanged}
      renderStep={(step, goTo) => (
        <FriendsOnboardingStep
          step={step}
          goTo={goTo}
          onEntityChanged={onEntityChanged}
        />
      )}
    />
  );
}

export default FriendsOnboardingModal;
