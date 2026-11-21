import { getTravelAccessQueryKey, useTravelAccess } from '@hatohui/models';
import { useAuth } from '@hatohui/libs';

export function useCanEdit(): boolean {
  const { user } = useAuth();
  const access = useTravelAccess({
    query: {
      queryKey: [...getTravelAccessQueryKey(), user?.id ?? 'anonymous'],
      enabled: Boolean(user),
    },
  });
  return Boolean(user && access.data?.data.canEdit);
}
