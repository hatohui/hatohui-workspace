import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import type { PersistQueryClientProviderProps } from '@tanstack/react-query-persist-client';
import {
  CATALOG_OPTIONS_STALE_TIME_MS,
  PERSISTED_QUERY_KEYS,
  QUERY_CACHE_BUSTER,
  QUERY_CACHE_MAX_AGE_MS,
  QUERY_CACHE_STORAGE_KEY,
} from '../constants/cache';

export const queryClient = new QueryClient();

for (const key of PERSISTED_QUERY_KEYS) {
  queryClient.setQueryDefaults([key], {
    staleTime: CATALOG_OPTIONS_STALE_TIME_MS,
    gcTime: QUERY_CACHE_MAX_AGE_MS,
  });
}

function safeStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export const persistOptions: PersistQueryClientProviderProps['persistOptions'] =
  {
    persister: createSyncStoragePersister({
      storage: safeStorage(),
      key: QUERY_CACHE_STORAGE_KEY,
    }),
    maxAge: QUERY_CACHE_MAX_AGE_MS,
    buster: QUERY_CACHE_BUSTER,
    dehydrateOptions: {
      shouldDehydrateQuery: (query) =>
        query.state.status === 'success' &&
        PERSISTED_QUERY_KEYS.some((key) => key === query.queryKey[0]),
    },
  };
