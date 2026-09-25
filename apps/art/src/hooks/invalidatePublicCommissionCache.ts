import type { QueryClient } from '@tanstack/react-query';
import { PUBLIC_COMMISSION_QUERY_PREFIXES } from '@/constants/commission';

export function invalidatePublicCommissionCache(queryClient: QueryClient) {
  void queryClient.invalidateQueries({
    predicate: ({ queryKey: [path] }) =>
      typeof path === 'string' &&
      PUBLIC_COMMISSION_QUERY_PREFIXES.some((prefix) =>
        path.startsWith(prefix),
      ),
  });
}
