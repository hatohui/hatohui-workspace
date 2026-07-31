import { useOnboardingState } from '@hatohui/models';
import { useAuth } from '@hatohui/libs';

export function useMyEntry() {
  const { user } = useAuth();
  const query = useOnboardingState({ query: { enabled: !!user } });

  return {
    entry: query.data?.data.entry ?? null,
    isLoading: query.isLoading,
  };
}
