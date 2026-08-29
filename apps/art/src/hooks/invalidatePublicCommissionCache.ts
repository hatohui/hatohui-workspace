import type { QueryClient } from '@tanstack/react-query';

export function invalidatePublicCommissionCache(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: ['/commission-pricing'] });
  void queryClient.invalidateQueries({ queryKey: ['/commission-types'] });
}
