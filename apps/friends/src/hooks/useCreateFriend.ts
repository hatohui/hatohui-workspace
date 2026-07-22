import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { useCreateFriend as useCreateFriendMutation } from '@hatohui/models';
import routes from '../constants/routes';
import { invalidateFriendQueries } from './friendQueryClient';

export function useCreateFriend() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useCreateFriendMutation({
    mutation: {
      onSuccess: async (created) => {
        await invalidateFriendQueries(queryClient);
        await navigate(routes.friend(created.data.id));
      },
    },
  });
}
