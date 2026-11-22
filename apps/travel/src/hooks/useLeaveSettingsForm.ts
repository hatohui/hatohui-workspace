import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getMyTravelJobProfileQueryKey,
  getTravelLeaveBalanceQueryKey,
  useConfirmMyTravelJobProfile,
  useMyTravelJobProfile,
  useUpsertMyTravelJobProfile,
} from '@hatohui/models';
import {
  DEFAULT_ANNUAL_LEAVE_DAYS,
  DEFAULT_SICK_LEAVE_DAYS,
} from '../constants/schedule';

function defaultCycleStart(): string {
  return `${new Date().getFullYear()}-01-01`;
}

export function useLeaveSettingsForm() {
  const queryClient = useQueryClient();
  const profileQuery = useMyTravelJobProfile();
  const upsert = useUpsertMyTravelJobProfile();
  const confirm = useConfirmMyTravelJobProfile();

  const [title, setTitle] = useState('');
  const [daysOfLeave, setDaysOfLeave] = useState(DEFAULT_ANNUAL_LEAVE_DAYS);
  const [daysOfSickLeave, setDaysOfSickLeave] = useState(
    DEFAULT_SICK_LEAVE_DAYS,
  );
  const [leaveCycleStart, setLeaveCycleStart] = useState(defaultCycleStart);

  const profile = profileQuery.data?.data ?? null;

  useEffect(() => {
    if (!profile) return;
    setTitle(profile.title ?? '');
    setDaysOfLeave(profile.daysOfLeave);
    setDaysOfSickLeave(profile.daysOfSickLeave);
    setLeaveCycleStart(profile.leaveCycleStart.slice(0, 10));
  }, [profile]);

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: getMyTravelJobProfileQueryKey(),
      }),
      queryClient.invalidateQueries({
        queryKey: getTravelLeaveBalanceQueryKey(),
      }),
    ]);
  };

  const save = async () => {
    await upsert.mutateAsync({
      data: {
        title: title.trim() || undefined,
        daysOfLeave,
        daysOfSickLeave,
        leaveCycleStart: `${leaveCycleStart}T00:00:00.000Z`,
      },
    });
    await invalidate();
  };

  const confirmCycle = async () => {
    await confirm.mutateAsync();
    await invalidate();
  };

  return {
    profile,
    isLoading: profileQuery.isLoading,
    title,
    setTitle,
    daysOfLeave,
    setDaysOfLeave,
    daysOfSickLeave,
    setDaysOfSickLeave,
    leaveCycleStart,
    setLeaveCycleStart,
    isSaving: upsert.isPending,
    isConfirming: confirm.isPending,
    save,
    confirmCycle,
  };
}
