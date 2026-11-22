import { useCallback } from 'react';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';

interface Entity {
  id: string;
}

interface Envelope<T> {
  data: T;
}

export function useOptimisticEntityPatch<T extends Entity>(
  detailKey: QueryKey,
  listKey: QueryKey,
) {
  const queryClient = useQueryClient();

  return useCallback(
    (id: string, patch: Partial<T>) => {
      const detail = queryClient.getQueriesData<Envelope<T>>({
        queryKey: detailKey,
      });
      const lists = queryClient.getQueriesData<Envelope<T[]>>({
        queryKey: listKey,
      });
      void queryClient.cancelQueries({ queryKey: detailKey });
      void queryClient.cancelQueries({ queryKey: listKey });

      for (const [key, current] of detail) {
        if (!current?.data) continue;
        queryClient.setQueryData<Envelope<T>>(key, {
          ...current,
          data: { ...current.data, ...patch },
        });
      }
      for (const [key, current] of lists) {
        if (!Array.isArray(current?.data)) continue;
        queryClient.setQueryData<Envelope<T[]>>(key, {
          ...current,
          data: current.data.map((item) =>
            item.id === id ? { ...item, ...patch } : item,
          ),
        });
      }

      return () => {
        for (const [key, snapshot] of [...detail, ...lists]) {
          queryClient.setQueryData(key, snapshot);
        }
      };
    },
    [queryClient, detailKey, listKey],
  );
}
