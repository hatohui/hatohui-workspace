import { useQueryClient } from '@tanstack/react-query';
import { useConnectFriend as useConnectFriendMutation } from '@hatohui/models';
import { invalidateFriendQueries } from './friendQueryClient';

export function useConnectFriend() {
  const queryClient = useQueryClient();

  return useConnectFriendMutation({
    mutation: {
      onSuccess: () => invalidateFriendQueries(queryClient),
    },
  });
}
