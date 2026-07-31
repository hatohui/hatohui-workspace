import { useIntersectionObserver } from '@hatohui/libs';
import type { FriendGroup } from '../hooks/useUpcomingSections';
import BirthdayCard from './BirthdayCard';

type Props = {
  groups: FriendGroup[];
  emptyMessage: string;
  hasMore: boolean;
  isFetchingMore: boolean;
  loadingMoreMessage: string;
  onLoadMore: () => void;
};

function BirthdayList({
  groups,
  emptyMessage,
  hasMore,
  isFetchingMore,
  loadingMoreMessage,
  onLoadMore,
}: Props) {
  const sentinelRef = useIntersectionObserver(onLoadMore, hasMore);

  if (groups.length === 0) {
    return <p className="text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.key}>
          {group.label && (
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
              <h2 className="font-serif text-xl">{group.label}</h2>
            </div>
          )}
          <ul className="ml-0.75 flex flex-col gap-3 border-l border-border py-1 pl-5">
            {group.friends.map((friend) => (
              <li key={friend.id}>
                <BirthdayCard friend={friend} />
              </li>
            ))}
          </ul>
        </div>
      ))}
      {hasMore && <div ref={sentinelRef} className="h-1" />}
      {isFetchingMore && (
        <p className="text-center text-sm text-muted-foreground">
          {loadingMoreMessage}
        </p>
      )}
    </div>
  );
}

export default BirthdayList;
