import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { useDeleteFriend as useDeleteFriendMutation } from '@hatohui/models';
import routes from '../constants/routes';
import { invalidateFriendQueries } from './friendQueryClient';

export function useDeleteFriend() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useDeleteFriendMutation({
    mutation: {
      onSuccess: async () => {
        await invalidateFriendQueries(queryClient);
        await navigate(routes.dashboard);
      },
    },
  });
}
