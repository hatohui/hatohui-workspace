import { useAuth } from '@hatohui/libs';

export function useCanEdit(): boolean {
  const { user } = useAuth();
  return Boolean(user?.isAdmin);
}
