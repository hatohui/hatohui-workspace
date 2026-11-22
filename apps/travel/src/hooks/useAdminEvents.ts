import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getAdminTravelEventsQueryKey,
  getTravelEventsQueryKey,
  useAdminTravelEvents,
  useApproveTravelEvent,
  useHardDeleteTravelEvent,
  type TravelEventDto,
} from '@hatohui/models';

export type AdminEventFilter = 'all' | 'pending' | 'approved';

export function useAdminEvents() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<AdminEventFilter>('pending');
  const [deleting, setDeleting] = useState<TravelEventDto | null>(null);

  const approvedParam =
    filter === 'all' ? undefined : filter === 'approved' ? true : false;

  const query = useAdminTravelEvents({ approved: approvedParam });
  const approveMutation = useApproveTravelEvent();
  const deleteMutation = useHardDeleteTravelEvent();

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: getAdminTravelEventsQueryKey(),
      }),
      queryClient.invalidateQueries({ queryKey: getTravelEventsQueryKey() }),
    ]);
  };

  const approve = async (id: string) => {
    await approveMutation.mutateAsync({ id });
    await invalidate();
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    await deleteMutation.mutateAsync({ id: deleting.id });
    setDeleting(null);
    await invalidate();
  };

  return {
    filter,
    setFilter,
    events: query.data?.data ?? [],
    isLoading: query.isLoading,
    isMutating: approveMutation.isPending || deleteMutation.isPending,
    approve,
    deleting,
    setDeleting,
    confirmDelete,
  };
}
