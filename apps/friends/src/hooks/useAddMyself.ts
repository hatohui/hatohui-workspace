import { useOnboardingOptIn, useOnboardingState } from '@hatohui/models';
import { useOnboardingModal } from '@hatohui/libs';

export function useAddMyself() {
  const stateQuery = useOnboardingState();
  const optIn = useOnboardingOptIn();
  const { open } = useOnboardingModal();

  return {
    isAssociated: stateQuery.data?.data.entry !== null,
    isLoading: stateQuery.isLoading,
    addMyself: () => {
      open();
      optIn.mutate({ data: { join: true } });
    },
  };
}
