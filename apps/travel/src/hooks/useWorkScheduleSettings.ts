import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getTravelLeaveBalanceQueryKey,
  getTravelScheduleExceptionsQueryKey,
  getTravelWorkScheduleQueryKey,
  useCreateTravelScheduleException,
  useDeleteTravelScheduleException,
  useTravelScheduleExceptions,
  useTravelWorkSchedule,
  useUpsertTravelWorkSchedule,
  type UpsertTravelWorkScheduleDto,
} from '@hatohui/models';
import type { WeekdayKey } from '../constants/schedule';

const INITIAL_SCHEDULE: UpsertTravelWorkScheduleDto = {
  sunday: false,
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: false,
};

export function useWorkScheduleSettings() {
  const queryClient = useQueryClient();
  const scheduleQuery = useTravelWorkSchedule();
  const exceptionsQuery = useTravelScheduleExceptions();
  const upsertSchedule = useUpsertTravelWorkSchedule();
  const createException = useCreateTravelScheduleException();
  const deleteException = useDeleteTravelScheduleException();

  const [days, setDays] =
    useState<UpsertTravelWorkScheduleDto>(INITIAL_SCHEDULE);
  const [exceptionDate, setExceptionDate] = useState('');
  const [exceptionIsWorkDay, setExceptionIsWorkDay] = useState(false);
  const [exceptionReason, setExceptionReason] = useState('');

  const serverSchedule = scheduleQuery.data?.data;

  useEffect(() => {
    if (!serverSchedule) return;
    setDays({
      sunday: serverSchedule.sunday,
      monday: serverSchedule.monday,
      tuesday: serverSchedule.tuesday,
      wednesday: serverSchedule.wednesday,
      thursday: serverSchedule.thursday,
      friday: serverSchedule.friday,
      saturday: serverSchedule.saturday,
    });
  }, [serverSchedule]);

  const toggleDay = (key: WeekdayKey) => {
    setDays((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const saveSchedule = async () => {
    await upsertSchedule.mutateAsync({ data: days });
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: getTravelWorkScheduleQueryKey(),
      }),
      queryClient.invalidateQueries({
        queryKey: getTravelLeaveBalanceQueryKey(),
      }),
    ]);
  };

  const addException = async () => {
    if (!exceptionDate) return;
    await createException.mutateAsync({
      data: {
        date: exceptionDate,
        isWorkDay: exceptionIsWorkDay,
        reason: exceptionReason.trim() || undefined,
      },
    });
    setExceptionDate('');
    setExceptionReason('');
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: getTravelScheduleExceptionsQueryKey(),
      }),
      queryClient.invalidateQueries({
        queryKey: getTravelLeaveBalanceQueryKey(),
      }),
    ]);
  };

  const removeException = async (id: string) => {
    await deleteException.mutateAsync({ id });
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: getTravelScheduleExceptionsQueryKey(),
      }),
      queryClient.invalidateQueries({
        queryKey: getTravelLeaveBalanceQueryKey(),
      }),
    ]);
  };

  return {
    days,
    toggleDay,
    saveSchedule,
    isSavingSchedule: upsertSchedule.isPending,
    isLoading: scheduleQuery.isLoading || exceptionsQuery.isLoading,
    exceptions: exceptionsQuery.data?.data ?? [],
    exceptionDate,
    setExceptionDate,
    exceptionIsWorkDay,
    setExceptionIsWorkDay,
    exceptionReason,
    setExceptionReason,
    addException,
    removeException,
    isAddingException: createException.isPending,
  };
}
