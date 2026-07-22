import type { QueryClient } from '@tanstack/react-query';

export function invalidateFriendQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({
    predicate: (query) =>
      typeof query.queryKey[0] === 'string' &&
      query.queryKey[0].startsWith('/friends'),
  });
}
