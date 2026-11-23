import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import {
  getTravelSpotsQueryKey,
  useBulkCreateTravelSpots,
  useDeleteTravelSpot,
  useTravelCountries,
  useTravelSpots,
  useUpdateTravelSpot,
  type TravelPlaceAreaDto,
  type TravelSpotDto,
} from '@hatohui/models';
import type { EditableColumn } from '@hatohui/ui';
import { CUISINE_LIST_SEPARATOR } from '../constants/admin';
import { MAX_CATEGORIES } from '../constants/travel';
import { formatAddedDate } from '../lib/formatDate';
import { useAdminAction } from './useAdminAction';
import { useRowDeletion } from './useRowDeletion';
import { useSpotCategorySuggestions } from './useSpotCategorySuggestions';

export interface SpotRow {
  id: string;
  name: string;
  categories: string;
  areaId: string;
  address: string;
  note: string;
  createdAt: string;
}

const toTagList = (value: string) =>
  value
    .split(CUISINE_LIST_SEPARATOR)
    .map((name) => name.trim())
    .filter(Boolean);

export function useAdminSpots() {
  const { t } = useTranslation();
  const query = useTravelSpots();
  const countries = useTravelCountries().data?.data ?? [];
  const update = useUpdateTravelSpot();
  const remove = useDeleteTravelSpot();
  const bulk = useBulkCreateTravelSpots();
  const categorySuggestions = useSpotCategorySuggestions();
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

  const rows: SpotRow[] = (query.data?.data ?? []).map((spot) => ({
    id: spot.id,
    name: spot.name,
    categories: spot.categories.join(`${CUISINE_LIST_SEPARATOR} `),
    areaId: spot.area?.id ?? '',
    address: spot.address ?? '',
    note: spot.note ?? '',
    createdAt: spot.createdAt,
  }));

  const columns: EditableColumn<SpotRow>[] = [
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
      selectPlaceholder: t('form.spotCategoriesPlaceholder'),
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
      label: t('spots.address'),
      editable: true,
      sortable: true,
      size: 200,
    },
    {
      key: 'note',
      label: t('places.note'),
      editable: true,
      sortable: true,
      size: 240,
    },
    {
      key: 'createdAt',
      label: t('admin.added'),
      sortable: true,
      render: (row) => formatAddedDate(row.createdAt),
      size: 130,
    },
  ];

  const spotsQueryKey = getTravelSpotsQueryKey();

  const commit = (id: string, key: keyof SpotRow, value: string) => {
    const data =
      key === 'categories'
        ? { categories: toTagList(value) }
        : { [key]: value };
    const optimisticPatch =
      key === 'areaId'
        ? { area: value ? (areaById.get(value) ?? null) : null }
        : data;
    void run<{ data: TravelSpotDto[] }>(
      () => update.mutateAsync({ id, data }),
      {
        queryKey: spotsQueryKey,
        apply: (current) => ({
          ...current,
          data: current.data.map((spot) =>
            spot.id === id ? { ...spot, ...optimisticPatch } : spot,
          ),
        }),
      },
    );
  };

  const deletion = useRowDeletion<SpotRow>(
    (row) =>
      run<{ data: TravelSpotDto[] }>(() => remove.mutateAsync({ id: row.id }), {
        queryKey: spotsQueryKey,
        apply: (current) => ({
          ...current,
          data: current.data.filter((spot) => spot.id !== row.id),
        }),
      }),
    () => false,
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
