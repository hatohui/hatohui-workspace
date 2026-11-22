import { useQueryClient } from '@tanstack/react-query';
import {
  getAdminTravelJobProfilesQueryKey,
  useAdminDeleteTravelJobProfile,
  useAdminTravelJobProfiles,
  useAdminUpdateTravelJobProfile,
  type TravelJobProfileDto,
} from '@hatohui/models';

export function useAdminJobProfiles() {
  const queryClient = useQueryClient();
  const query = useAdminTravelJobProfiles();
  const update = useAdminUpdateTravelJobProfile();
  const remove = useAdminDeleteTravelJobProfile();

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: getAdminTravelJobProfilesQueryKey(),
    });

  const saveRow = async (
    profile: TravelJobProfileDto,
    patch: {
      title?: string;
      daysOfLeave?: number;
      daysOfSickLeave?: number;
      leaveCycleStart?: string;
    },
  ) => {
    await update.mutateAsync({
      id: profile.id,
      data: {
        title: (patch.title ?? profile.title ?? undefined) || undefined,
        daysOfLeave: patch.daysOfLeave ?? profile.daysOfLeave,
        daysOfSickLeave: patch.daysOfSickLeave ?? profile.daysOfSickLeave,
        leaveCycleStart: patch.leaveCycleStart ?? profile.leaveCycleStart,
      },
    });
    await invalidate();
  };

  const deleteRow = async (id: string) => {
    await remove.mutateAsync({ id });
    await invalidate();
  };

  return {
    profiles: query.data?.data ?? [],
    isLoading: query.isLoading,
    isMutating: update.isPending || remove.isPending,
    saveRow,
    deleteRow,
  };
}
