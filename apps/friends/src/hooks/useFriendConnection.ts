import { useQueryClient } from '@tanstack/react-query';
import {
  useConnectFriend,
  useDisconnectFriend,
  type FriendDto,
} from '@hatohui/models';
import { useAuth } from '@hatohui/libs';
import { invalidateFriendQueries } from './friendQueryClient';

export type ConnectionAction = 'connect' | 'accept' | 'cancel' | 'disconnect';

/// Turns the entry's connectionStatus into the one action the viewer can take.
/// Connecting and accepting hit the same endpoint — the API accepts an
/// existing incoming request rather than creating a second one — so the
/// difference here is only what the button says.
export function useFriendConnection(friend: FriendDto) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const onSettled = { onSuccess: () => invalidateFriendQueries(queryClient) };

  const connect = useConnectFriend({ mutation: onSettled });
  const disconnect = useDisconnectFriend({ mutation: onSettled });

  const isSignedIn = user !== null;
  const canAct = isSignedIn && !friend.isViewerEntry && friend.isAssociated;

  const action: ConnectionAction | null = !canAct
    ? null
    : friend.connectionStatus === 'NONE'
      ? 'connect'
      : friend.connectionStatus === 'PENDING_INCOMING'
        ? 'accept'
        : friend.connectionStatus === 'PENDING_OUTGOING'
          ? 'cancel'
          : 'disconnect';

  const run = () => {
    if (action === 'connect' || action === 'accept') {
      connect.mutate({ id: friend.id });
      return;
    }
    if (action === 'cancel' || action === 'disconnect') {
      disconnect.mutate({ id: friend.id });
    }
  };

  return {
    action,
    run,
    isBusy: connect.isPending || disconnect.isPending,
    error: connect.error ?? disconnect.error,
    isConnected: friend.connectionStatus === 'ACCEPTED',
  };
}
