import { useMemo } from 'react';
import type { FriendDto } from '@hatohui/models';

export function useBirthdaysByMonthDay(
  friends: FriendDto[],
): Map<string, FriendDto[]> {
  return useMemo(() => {
    const map = new Map<string, FriendDto[]>();
    for (const friend of friends) {
      if (friend.birthMonth === null || friend.birthDay === null) continue;
      const key = `${friend.birthMonth}-${friend.birthDay}`;
      const existing = map.get(key);
      if (existing) {
        existing.push(friend);
      } else {
        map.set(key, [friend]);
      }
    }
    return map;
  }, [friends]);
}
