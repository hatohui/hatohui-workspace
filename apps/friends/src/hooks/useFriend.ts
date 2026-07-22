import { useFriend as useFriendQuery } from '@hatohui/models';

export function useFriend(id: string) {
  return useFriendQuery(id);
}
