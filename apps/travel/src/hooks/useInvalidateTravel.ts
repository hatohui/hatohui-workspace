import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const TRAVEL_KEY_PREFIX = '/travel';

export function useInvalidateTravel() {
  const queryClient = useQueryClient();
  return useCallback(
    () =>
      queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === 'string' &&
          query.queryKey[0].startsWith(TRAVEL_KEY_PREFIX),
      }),
    [queryClient],
  );
}
