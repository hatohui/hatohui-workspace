import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import {
  getTravelPlacesQueryKey,
  useBulkCreateTravelPlaces,
  useDeleteTravelPlace,
  useTravelCountries,
  useTravelPlaces,
  useUpdateTravelPlace,
  type TravelPlaceAreaDto,
  type TravelPlaceDto,
} from '@hatohui/models';
import type { EditableColumn } from '@hatohui/ui';
import { CUISINE_LIST_SEPARATOR } from '../constants/admin';
import { MAX_CATEGORIES } from '../constants/travel';
import { formatAddedDate } from '../lib/formatDate';
import { useAdminAction } from './useAdminAction';
import { usePlaceCategorySuggestions } from './usePlaceCategorySuggestions';
import { useRowDeletion } from './useRowDeletion';

export interface PlaceRow {
  id: string;
  name: string;
  categories: string;
  areaId: string;
  address: string;
  note: string;
  dishCount: number;
  createdAt: string;
}

const toTagList = (value: string) =>
  value
    .split(CUISINE_LIST_SEPARATOR)
    .map((name) => name.trim())
    .filter(Boolean);

export function useAdminPlaces() {
  const { t } = useTranslation();
  const query = useTravelPlaces();
  const countries = useTravelCountries().data?.data ?? [];
  const update = useUpdateTravelPlace();
  const remove = useDeleteTravelPlace();
  const bulk = useBulkCreateTravelPlaces();
  const categorySuggestions = usePlaceCategorySuggestions();
  const { run, runBulk } = useAdminAction();
  const [targetAreaId, setTargetAreaId] = useState('');

  const areas: TravelPlaceAreaDto[] = countries.flatMap((country) =>
    country.areas.map((area) => ({
      id: area.id,
      name: area.name,
      countryId: country.id,
      countryName: country.name,
    })),
  );
  const areaOptions = [
    { value: '', label: t('admin.noArea') },
    ...areas.map((area) => ({
      value: area.id,
      label: `${area.name} (${area.countryName})`,
    })),
  ];
  const areaById = new Map(areas.map((area) => [area.id, area]));

  const rows: PlaceRow[] = (query.data?.data ?? []).map((place) => ({
    id: place.id,
    name: place.name,
    categories: place.categories.join(`${CUISINE_LIST_SEPARATOR} `),
    areaId: place.area?.id ?? '',
    address: place.address ?? '',
    note: place.note ?? '',
    dishCount: place.dishCount,
    createdAt: place.createdAt,
  }));

  const columns: EditableColumn<PlaceRow>[] = [
    {
      key: 'name',
      label: t('admin.name'),
      editable: true,
      sortable: true,
      size: 200,
    },
    {
      key: 'categories',
      label: t('admin.categories'),
      editable: true,
      sortable: true,
      suggestions: categorySuggestions,
      maxTags: MAX_CATEGORIES,
      selectPlaceholder: t('form.placeCategoriesPlaceholder'),
      createLabel: (tag) => t('form.categoryCreate', { tag }),
      removeLabel: (tag) => t('form.categoryRemove', { tag }),
      size: 220,
    },
    {
      key: 'areaId',
      label: t('admin.area'),
      editable: true,
      sortable: true,
      options: areaOptions,
      render: (row) =>
        row.areaId ? (areaById.get(row.areaId)?.name ?? '') : '',
      size: 160,
    },
    {
      key: 'address',
      label: t('places.address'),
      editable: true,
      sortable: true,
      size: 200,
    },
    {
      key: 'note',
      label: t('places.note'),
      editable: true,
      sortable: true,
      size: 220,
    },
    {
      key: 'dishCount',
      label: t('admin.dishes'),
      sortable: true,
      size: 90,
    },
    {
      key: 'createdAt',
      label: t('admin.added'),
      sortable: true,
      render: (row) => formatAddedDate(row.createdAt),
      size: 130,
    },
  ];

  const placesQueryKey = getTravelPlacesQueryKey();

  const commit = (id: string, key: keyof PlaceRow, value: string) => {
    const data =
      key === 'categories'
        ? { categories: toTagList(value) }
        : { [key]: value };
    const optimisticPatch =
      key === 'areaId'
        ? { area: value ? (areaById.get(value) ?? null) : null }
        : data;
    void run<{ data: TravelPlaceDto[] }>(
      () => update.mutateAsync({ id, data }),
      {
        queryKey: placesQueryKey,
        apply: (current) => ({
          ...current,
          data: current.data.map((place) =>
            place.id === id ? { ...place, ...optimisticPatch } : place,
          ),
        }),
      },
    );
  };

  const deletion = useRowDeletion<PlaceRow>(
    (row) =>
      run<{ data: TravelPlaceDto[] }>(
        () => remove.mutateAsync({ id: row.id }),
        {
          queryKey: placesQueryKey,
          apply: (current) => ({
            ...current,
            data: current.data.filter((place) => place.id !== row.id),
          }),
        },
      ),
    (row) => row.dishCount > 0,
  );

  return {
    rows,
    columns,
    areaOptions,
    targetAreaId,
    setTargetAreaId,
    isLoading: query.isLoading,
    deletion,
    commit,
    add: (names: string[]) =>
      runBulk(() =>
        bulk.mutateAsync({
          data: { names, areaId: targetAreaId || undefined },
        }),
      ),
  };
}
