import { useMemo } from 'react';
import type { UpcomingFriendDto } from '@hatohui/models';

/// Keyed by "month-day" (birthdays recur every year regardless of which
/// year a calendar cell belongs to), not by the friend's next-occurrence
/// date — that's what lets the grid show correct birthdays for any month
/// the user navigates to, not just the ones coming up next.
export function useBirthdaysByMonthDay(
  friends: UpcomingFriendDto[],
): Map<string, UpcomingFriendDto[]> {
  return useMemo(() => {
    const map = new Map<string, UpcomingFriendDto[]>();
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
