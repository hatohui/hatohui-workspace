import { useQueryClient } from '@tanstack/react-query';
import { OnboardingModal } from '@hatohui/libs';
import { invalidateFriendQueries } from '../hooks/friendQueryClient';

function FriendsOnboardingModal() {
  const client = useQueryClient();
  return (
    <OnboardingModal
      mode="full"
      onEntityChanged={() => void invalidateFriendQueries(client)}
    />
  );
}

export default FriendsOnboardingModal;
