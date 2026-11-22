import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import {
  getAdminTravelEventsQueryKey,
  getTravelEventQueryKey,
  getTravelEventsQueryKey,
  useCreateTravelEvent,
  useDeleteTravelEvent,
  useTravelEvent,
  useUpdateTravelEvent,
  type CreateTravelEventDtoVisibility,
} from '@hatohui/models';
import routes from '../constants/routes';
import { useDishPhoto } from './useDishPhoto';
import { useTravelLocation } from './useTravelLocation';

function toLocalInput(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function useTravelEventForm(eventId?: string) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { area } = useTravelLocation();
  const defaultAreaId = area?.id ?? '';

  const existingQuery = useTravelEvent(eventId ?? '', {
    query: { enabled: Boolean(eventId) },
  });
  const createMutation = useCreateTravelEvent();
  const updateMutation = useUpdateTravelEvent();
  const deleteMutation = useDeleteTravelEvent();

  const existing = existingQuery.data?.data ?? null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [visibility, setVisibility] =
    useState<CreateTravelEventDtoVisibility>('PUBLIC');
  const [isYearly, setIsYearly] = useState(false);
  const [location, setLocation] = useState('');
  const [mapsUrl, setMapsUrl] = useState('');
  const [reference, setReference] = useState('');
  const [areaId, setAreaId] = useState<string>(defaultAreaId ?? '');

  const photo = useDishPhoto(
    existing?.imageKey ?? null,
    existing?.previewUrl ?? existing?.imageUrl ?? null,
  );

  useEffect(() => {
    if (!existing) return;
    setTitle(existing.title);
    setDescription(existing.description ?? '');
    setStartAt(toLocalInput(existing.startAt));
    setEndAt(toLocalInput(existing.endAt));
    setVisibility(existing.visibility);
    setIsYearly(existing.isYearly);
    setLocation(existing.location ?? '');
    setMapsUrl(existing.mapsUrl ?? '');
    setReference(existing.reference ?? '');
    setAreaId(existing.areaId ?? '');
  }, [existing]);

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getTravelEventsQueryKey() }),
      queryClient.invalidateQueries({
        queryKey: getAdminTravelEventsQueryKey(),
      }),
      ...(eventId
        ? [
            queryClient.invalidateQueries({
              queryKey: getTravelEventQueryKey(eventId),
            }),
          ]
        : []),
    ]);
  };

  const submit = async () => {
    if (!title.trim() || !startAt || !endAt) return;
    const uploaded = await photo.uploadPending();
    if (!uploaded.ok) return;

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      startAt: new Date(startAt).toISOString(),
      endAt: new Date(endAt).toISOString(),
      visibility,
      isYearly,
      location: location.trim() || undefined,
      mapsUrl: mapsUrl.trim() || undefined,
      reference: reference.trim() || undefined,
      areaId: areaId || undefined,
      imageKey: uploaded.imageKey ?? undefined,
    };

    if (eventId) {
      await updateMutation.mutateAsync({
        id: eventId,
        data: {
          ...payload,
          description: description.trim() || null,
          location: location.trim() || null,
          mapsUrl: mapsUrl.trim() || null,
          reference: reference.trim() || null,
          areaId: areaId || null,
          imageKey: uploaded.imageKey,
        },
      });
    } else {
      await createMutation.mutateAsync({ data: payload });
    }

    await invalidate();
    void navigate(routes.events);
  };

  const remove = async () => {
    if (!eventId) return;
    await deleteMutation.mutateAsync({ id: eventId });
    await invalidate();
    void navigate(routes.events);
  };

  return {
    isEdit: Boolean(eventId),
    isLoading: Boolean(eventId) && existingQuery.isLoading,
    title,
    setTitle,
    description,
    setDescription,
    startAt,
    setStartAt,
    endAt,
    setEndAt,
    visibility,
    setVisibility,
    isYearly,
    setIsYearly,
    location,
    setLocation,
    mapsUrl,
    setMapsUrl,
    reference,
    setReference,
    areaId,
    setAreaId,
    photo,
    isSaving:
      photo.isUploading || createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    submit,
    remove,
  };
}
