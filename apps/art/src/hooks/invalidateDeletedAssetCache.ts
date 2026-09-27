import type { QueryClient } from '@tanstack/react-query';
import { ASSET_DELETION_QUERY_PREFIXES } from '@/constants/gallery';

export function invalidateDeletedAssetCache(queryClient: QueryClient) {
  void queryClient.invalidateQueries({
    predicate: ({ queryKey: [path] }) =>
      typeof path === 'string' &&
      ASSET_DELETION_QUERY_PREFIXES.some((prefix) => path.startsWith(prefix)),
  });
}
