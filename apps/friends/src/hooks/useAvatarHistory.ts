import { useQueryClient } from '@tanstack/react-query';
import {
  useFriendAvatarVersions,
  useRestoreFriendAvatarVersion,
} from '@hatohui/models';
import { invalidateFriendQueries } from './friendQueryClient';

export function useAvatarHistory(friendId: string | undefined) {
  const queryClient = useQueryClient();
  const versionsQuery = useFriendAvatarVersions(friendId ?? '', {
    query: { enabled: friendId !== undefined },
  });
  const restore = useRestoreFriendAvatarVersion({
    mutation: {
      onSuccess: () => invalidateFriendQueries(queryClient),
    },
  });

  return {
    versions: versionsQuery.data?.data.versions ?? [],
    isLoading: versionsQuery.isLoading,
    restore: (versionId: string) =>
      friendId
        ? restore.mutateAsync({ id: friendId, versionId })
        : Promise.reject(new Error('Missing friend id')),
    isRestoring: restore.isPending,
  };
}
