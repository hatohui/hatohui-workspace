'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  getArtistAboutQueryKey,
  useArtistAbout,
  useUpdateArtistAbout,
} from '@hatohui/models';

export function useAboutEditor() {
  const queryClient = useQueryClient();
  const query = useArtistAbout();
  const update = useUpdateArtistAbout({
    mutation: {
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: getArtistAboutQueryKey() }),
    },
  });

  return {
    about: query.data?.data,
    isLoading: query.isPending,
    isSaving: update.isPending,
    save: update.mutateAsync,
  };
}
