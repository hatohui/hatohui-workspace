import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getTravelCustomHolidaysQueryKey,
  getTravelHolidayCountryQueryKey,
  getTravelHolidaysQueryKey,
  getTravelLeaveBalanceQueryKey,
  useCreateTravelCustomHoliday,
  useDeleteTravelCustomHoliday,
  useTravelCustomHolidays,
  useTravelHolidayCountry,
  useTravelHolidays,
  useUpdateTravelHolidayCountry,
} from '@hatohui/models';

export function useHolidaySettings() {
  const queryClient = useQueryClient();
  const year = new Date().getFullYear();
  const range = { from: `${year}-01-01`, to: `${year}-12-31` };

  const countryQuery = useTravelHolidayCountry();
  const publicHolidaysQuery = useTravelHolidays(range);
  const customHolidaysQuery = useTravelCustomHolidays();
  const updateCountry = useUpdateTravelHolidayCountry();
  const createCustom = useCreateTravelCustomHoliday();
  const deleteCustom = useDeleteTravelCustomHoliday();

  const [newDate, setNewDate] = useState('');
  const [newName, setNewName] = useState('');

  const setCountry = async (country: string) => {
    await updateCountry.mutateAsync({ data: { country } });
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: getTravelHolidayCountryQueryKey(),
      }),
      queryClient.invalidateQueries({
        queryKey: getTravelHolidaysQueryKey(range),
      }),
      queryClient.invalidateQueries({
        queryKey: getTravelLeaveBalanceQueryKey(),
      }),
    ]);
  };

  const addCustomHoliday = async () => {
    if (!newDate || !newName.trim()) return;
    await createCustom.mutateAsync({
      data: { date: newDate, name: newName.trim() },
    });
    setNewDate('');
    setNewName('');
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: getTravelCustomHolidaysQueryKey(),
      }),
      queryClient.invalidateQueries({
        queryKey: getTravelLeaveBalanceQueryKey(),
      }),
    ]);
  };

  const removeCustomHoliday = async (id: string) => {
    await deleteCustom.mutateAsync({ id });
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: getTravelCustomHolidaysQueryKey(),
      }),
      queryClient.invalidateQueries({
        queryKey: getTravelLeaveBalanceQueryKey(),
      }),
    ]);
  };

  return {
    year,
    country: countryQuery.data?.data.country ?? 'VN',
    setCountry,
    isUpdatingCountry: updateCountry.isPending,
    publicHolidays: publicHolidaysQuery.data?.data ?? [],
    customHolidays: customHolidaysQuery.data?.data ?? [],
    isLoading:
      countryQuery.isLoading ||
      publicHolidaysQuery.isLoading ||
      customHolidaysQuery.isLoading,
    newDate,
    setNewDate,
    newName,
    setNewName,
    addCustomHoliday,
    removeCustomHoliday,
    isAddingCustom: createCustom.isPending,
  };
}
