import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@hatohui/i18n';
import {
  getTravelActivitiesQueryKey,
  getTravelParticipationQueryKey,
  useCreateTravelActivity,
  useDeleteTravelActivity,
  useTravelActivities,
  useTravelPlaces,
  useUpdateTravelParticipationDates,
  type TravelActivityDto,
  type TravelParticipantMemberDto,
  type TravelParticipationDetailDto,
} from '@hatohui/models';

export interface TimelineItem {
  id: string;
  kind: 'activity' | 'arrival' | 'departure' | 'event-start' | 'event-end';
  title: string;
  from: string;
  to: string;
  location: string | null;
  mapsUrl: string | null;
  placeId: string | null;
  placeName: string | null;
  note: string | null;
  flights: string[];
  involvedPeople: string[];
  isExcludeMode: boolean;
  activity?: TravelActivityDto;
  editableParticipationId?: string;
}

export function useTravelTimeline(
  plan: TravelParticipationDetailDto,
  viewerId?: string,
) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const activitiesQuery = useTravelActivities(plan.id);
  const placesQuery = useTravelPlaces({});
  const createMutation = useCreateTravelActivity();
  const deleteMutation = useDeleteTravelActivity();
  const updateDatesMutation = useUpdateTravelParticipationDates();

  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [showEventBoundaries, setShowEventBoundaries] = useState(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddForm, setShowAddForm] = useState(false);

  const activities = useMemo(
    () => activitiesQuery.data?.data ?? [],
    [activitiesQuery.data],
  );

  const allItems = useMemo<TimelineItem[]>(() => {
    const items: TimelineItem[] = [];

    const arrivalsByTime = new Map<string, TravelParticipantMemberDto[]>();
    const departuresByTime = new Map<string, TravelParticipantMemberDto[]>();

    for (const p of plan.participants) {
      if (p.isAlreadyHere) continue;
      const arrList = arrivalsByTime.get(p.from) ?? [];
      arrList.push(p);
      arrivalsByTime.set(p.from, arrList);

      const depList = departuresByTime.get(p.to) ?? [];
      depList.push(p);
      departuresByTime.set(p.to, depList);
    }

    for (const [iso, members] of arrivalsByTime.entries()) {
      const names = members.map((m) => m.displayName).join(', ');
      const canEdit =
        members.length === 1 &&
        (plan.isOwner || members[0].userId === viewerId);
      items.push({
        id: `arrival-${iso}`,
        kind: 'arrival',
        title: t('plans.timeline.arrives', { names }),
        from: iso,
        to: iso,
        location: null,
        mapsUrl: null,
        placeId: null,
        placeName: null,
        note: null,
        flights: members
          .map((m) => m.entryFlight)
          .filter((f): f is string => Boolean(f)),
        involvedPeople: members.map((m) => m.userId),
        isExcludeMode: false,
        editableParticipationId: canEdit ? members[0].id : undefined,
      });
    }

    for (const [iso, members] of departuresByTime.entries()) {
      const names = members.map((m) => m.displayName).join(', ');
      const canEdit =
        members.length === 1 &&
        (plan.isOwner || members[0].userId === viewerId);
      items.push({
        id: `departure-${iso}`,
        kind: 'departure',
        title: t('plans.timeline.departs', { names }),
        from: iso,
        to: iso,
        location: null,
        mapsUrl: null,
        placeId: null,
        placeName: null,
        note: null,
        flights: members
          .map((m) => m.exitFlight)
          .filter((f): f is string => Boolean(f)),
        involvedPeople: members.map((m) => m.userId),
        isExcludeMode: false,
        editableParticipationId: canEdit ? members[0].id : undefined,
      });
    }

    if (showEventBoundaries && plan.event) {
      items.push(
        {
          id: 'event-start',
          kind: 'event-start',
          title: t('plans.timeline.eventStarts', { title: plan.event.title }),
          from: plan.event.startAt,
          to: plan.event.startAt,
          location: plan.event.location,
          mapsUrl: plan.event.mapsUrl,
          placeId: null,
          placeName: null,
          note: null,
          flights: [],
          involvedPeople: [],
          isExcludeMode: false,
        },
        {
          id: 'event-end',
          kind: 'event-end',
          title: t('plans.timeline.eventEnds', { title: plan.event.title }),
          from: plan.event.endAt,
          to: plan.event.endAt,
          location: plan.event.location,
          mapsUrl: plan.event.mapsUrl,
          placeId: null,
          placeName: null,
          note: null,
          flights: [],
          involvedPeople: [],
          isExcludeMode: false,
        },
      );
    }

    for (const act of activities) {
      items.push({
        id: act.id,
        kind: 'activity',
        title: act.name,
        from: act.from,
        to: act.to,
        location: act.location ?? act.place?.name ?? null,
        mapsUrl: act.mapsUrl ?? act.place?.mapsUrl ?? null,
        placeId: act.place?.id ?? null,
        placeName: act.place?.name ?? null,
        note: act.note,
        flights: [],
        involvedPeople: act.involvedPeople,
        isExcludeMode: act.isExcludeMode,
        activity: act,
      });
    }

    return items;
  }, [activities, plan, showEventBoundaries, t, viewerId]);

  const visibleItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allItems
      .filter((item) => {
        if (q) {
          const titleHit = item.title.toLowerCase().includes(q);
          const locHit = item.location?.toLowerCase().includes(q) ?? false;
          const noteHit = item.note?.toLowerCase().includes(q) ?? false;
          if (!titleHit && !locHit && !noteHit) return false;
        }
        if (selectedUserId) {
          if (item.involvedPeople.length === 0) return true;
          const hasUser = item.involvedPeople.includes(selectedUserId);
          return item.isExcludeMode ? !hasUser : hasUser;
        }
        return true;
      })
      .sort((a, b) => {
        const diff = new Date(a.from).getTime() - new Date(b.from).getTime();
        return sortOrder === 'asc' ? diff : -diff;
      });
  }, [allItems, search, selectedUserId, sortOrder]);

  const upcomingItems = useMemo(() => {
    const nowMs = Date.now();
    return [...allItems]
      .filter((item) => new Date(item.from).getTime() > nowMs)
      .sort((a, b) => new Date(a.from).getTime() - new Date(b.from).getTime())
      .slice(0, 5);
  }, [allItems]);

  const addActivity = async (data: {
    name: string;
    from: string;
    to: string;
    placeId?: string;
    location?: string;
    mapsUrl?: string;
    note?: string;
    involvedPeople?: string[];
    isExcludeMode?: boolean;
  }) => {
    await createMutation.mutateAsync({ id: plan.id, data });
    setShowAddForm(false);
    await queryClient.invalidateQueries({
      queryKey: getTravelActivitiesQueryKey(plan.id),
    });
  };

  const removeActivity = async (activityId: string) => {
    await deleteMutation.mutateAsync({ id: plan.id, activityId });
    await queryClient.invalidateQueries({
      queryKey: getTravelActivitiesQueryKey(plan.id),
    });
  };

  const updateMemberFlightOrDate = async (
    targetParticipationId: string,
    patch: {
      from?: string;
      to?: string;
      entryFlight?: string | null;
      exitFlight?: string | null;
    },
  ) => {
    await updateDatesMutation.mutateAsync({
      id: targetParticipationId,
      data: patch,
    });
    await queryClient.invalidateQueries({
      queryKey: getTravelParticipationQueryKey(plan.id),
    });
  };

  return {
    activities,
    visibleItems,
    upcomingItems,
    places: placesQuery.data?.data ?? [],
    isLoading: activitiesQuery.isLoading,
    search,
    setSearch,
    selectedUserId,
    setSelectedUserId,
    showEventBoundaries,
    setShowEventBoundaries,
    sortOrder,
    setSortOrder,
    showAddForm,
    setShowAddForm,
    isCreating: createMutation.isPending,
    addActivity,
    removeActivity,
    updateMemberFlightOrDate,
  };
}
