import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import {
  getMyTravelParticipationsQueryKey,
  getTravelJoinRequestsQueryKey,
  getTravelParticipationQueryKey,
  useApproveTravelJoinRequest,
  useCreateTravelJoinRequest,
  useDeleteTravelGroup,
  useKickTravelMember,
  useLeaveTravelGroup,
  useRejectTravelJoinRequest,
  useTransferTravelOwnership,
  useTravelJoinRequests,
  useTravelParticipation,
  useUpdateTravelGroupSettings,
  type UpdateTravelGroupSettingsDto,
} from '@hatohui/models';
import { useToast } from '@hatohui/ui';
import { useTranslation } from '@hatohui/i18n';
import routes from '../constants/routes';

export type PlanTab =
  'overview' | 'timeline' | 'gallery' | 'members' | 'settings';

export function useTravelPlanDetail(id: string) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [tab, setTab] = useState<PlanTab>('overview');

  const detailQuery = useTravelParticipation(id, {
    query: { enabled: Boolean(id), retry: false },
  });
  const plan = detailQuery.data?.data ?? null;

  const requestsQuery = useTravelJoinRequests(id, {
    query: { enabled: Boolean(plan?.isOwner) },
  });

  const updateSettings = useUpdateTravelGroupSettings();
  const requestJoinMutation = useCreateTravelJoinRequest();
  const approveMutation = useApproveTravelJoinRequest();
  const rejectMutation = useRejectTravelJoinRequest();
  const kickMutation = useKickTravelMember();
  const leaveMutation = useLeaveTravelGroup();
  const transferMutation = useTransferTravelOwnership();
  const deleteMutation = useDeleteTravelGroup();

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: getTravelParticipationQueryKey(id),
      }),
      queryClient.invalidateQueries({
        queryKey: getTravelJoinRequestsQueryKey(id),
      }),
      queryClient.invalidateQueries({
        queryKey: getMyTravelParticipationsQueryKey(),
      }),
    ]);
  };

  const saveSettings = async (data: UpdateTravelGroupSettingsDto) => {
    await updateSettings.mutateAsync({ id, data });
    await invalidate();
  };

  const requestJoin = async () => {
    await requestJoinMutation.mutateAsync({ id });
    await invalidate();
  };

  const approveRequest = async (requestId: string) => {
    await approveMutation.mutateAsync({ id, requestId });
    await invalidate();
  };

  const rejectRequest = async (requestId: string) => {
    await rejectMutation.mutateAsync({ id, requestId });
    await invalidate();
  };

  const kickMember = async (userId: string) => {
    await kickMutation.mutateAsync({ id, data: { userId } });
    await invalidate();
  };

  const transferOwner = async (newOwnerId: string) => {
    await transferMutation.mutateAsync({ id, data: { newOwnerId } });
    await invalidate();
  };

  const leave = async () => {
    await leaveMutation.mutateAsync({ id });
    await invalidate();
    void navigate(routes.plans);
  };

  const deletePlan = async () => {
    await deleteMutation.mutateAsync({ id });
    await invalidate();
    void navigate(routes.plans);
  };

  const copyShareLink = async () => {
    const url = `${window.location.origin}${routes.sharePlan(id)}`;
    await navigator.clipboard.writeText(url);
    toast.success(t('plans.share.copied'));
  };

  return {
    plan,
    isLoading: detailQuery.isLoading,
    isError: detailQuery.isError,
    tab,
    setTab,
    joinRequests: requestsQuery.data?.data ?? [],
    isSavingSettings: updateSettings.isPending,
    saveSettings,
    requestJoin,
    approveRequest,
    rejectRequest,
    kickMember,
    transferOwner,
    leave,
    deletePlan,
    copyShareLink,
  };
}
