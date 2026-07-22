import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { useUpdateFriend as useUpdateFriendMutation } from '@hatohui/models';
import routes from '../constants/routes';
import { invalidateFriendQueries } from './friendQueryClient';

export function useUpdateFriend() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useUpdateFriendMutation({
    mutation: {
      onSuccess: async (updated) => {
        await invalidateFriendQueries(queryClient);
        await navigate(routes.friend(updated.data.id));
      },
    },
  });
}
