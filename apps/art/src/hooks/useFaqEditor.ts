'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  getArtistFaqQueryKey,
  useArtistFaq,
  useUpdateArtistFaq,
} from '@hatohui/models';

export function useFaqEditor() {
  const queryClient = useQueryClient();
  const query = useArtistFaq();
  const update = useUpdateArtistFaq({
    mutation: {
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: getArtistFaqQueryKey() }),
    },
  });

  return {
    items: query.data?.data.items,
    isSaving: update.isPending,
    save: update.mutateAsync,
  };
}
