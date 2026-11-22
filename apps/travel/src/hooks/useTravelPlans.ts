import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import {
  getMyTravelParticipationsQueryKey,
  getTravelLeaveBalanceQueryKey,
  useCreateTravelParticipation,
  useMyTravelParticipations,
  useTravelEvents,
  type CreateTravelParticipationDtoLeaveType,
} from '@hatohui/models';
import routes from '../constants/routes';

export function useTravelPlans(enabled: boolean) {
  const query = useMyTravelParticipations(undefined, { query: { enabled } });
  return {
    plans: query.data?.data ?? [],
    isLoading: query.isLoading,
  };
}

export function useCreateTravelPlanForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const eventsQuery = useTravelEvents({});
  const createMutation = useCreateTravelParticipation();

  const [eventId, setEventId] = useState('');
  const [groupName, setGroupName] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [leaveType, setLeaveType] =
    useState<CreateTravelParticipationDtoLeaveType>('ANNUAL');
  const [entryFlight, setEntryFlight] = useState('');
  const [exitFlight, setExitFlight] = useState('');
  const [isAlreadyHere, setIsAlreadyHere] = useState(false);

  const submit = async () => {
    if (!from || !to) return;
    const result = await createMutation.mutateAsync({
      data: {
        eventId: eventId || undefined,
        groupName: groupName.trim() || undefined,
        from: new Date(from).toISOString(),
        to: new Date(to).toISOString(),
        leaveType,
        isAlreadyHere,
        entryFlight: entryFlight.trim() || undefined,
        exitFlight: exitFlight.trim() || undefined,
      },
    });
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: getMyTravelParticipationsQueryKey(),
      }),
      queryClient.invalidateQueries({
        queryKey: getTravelLeaveBalanceQueryKey(),
      }),
    ]);
    void navigate(routes.plan(result.data.id));
  };

  return {
    events: eventsQuery.data?.data ?? [],
    eventId,
    setEventId,
    groupName,
    setGroupName,
    from,
    setFrom,
    to,
    setTo,
    leaveType,
    setLeaveType,
    entryFlight,
    setEntryFlight,
    exitFlight,
    setExitFlight,
    isAlreadyHere,
    setIsAlreadyHere,
    isSaving: createMutation.isPending,
    submit,
  };
}
