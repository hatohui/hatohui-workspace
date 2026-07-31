import { useBirthdaysByMonth } from '@hatohui/models';

export function useMonthlyBirthdays(month: number, search: string) {
  const query = useBirthdaysByMonth({ month, query: search || undefined });

  return {
    friends: query.data?.data.friends ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
