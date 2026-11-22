import { useMemo } from 'react';
import { useAuth } from '@hatohui/libs';
import {
  getTravelAllergiesQueryKey,
  useTravelAllergies,
} from '@hatohui/models';

export function useMyAllergies() {
  const { user } = useAuth();
  const query = useTravelAllergies({
    query: {
      queryKey: [...getTravelAllergiesQueryKey(), user?.id ?? 'anonymous'],
      enabled: Boolean(user),
    },
  });
  const allergens = useMemo(
    () => (user ? (query.data?.data.allergens ?? []) : []),
    [user, query.data?.data.allergens],
  );

  return {
    allergens,
    isLoading: query.isLoading,
    cautionFor: (keys: string[]) =>
      keys.filter((key) => allergens.includes(key)),
  };
}
