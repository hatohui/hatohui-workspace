import { useTranslation } from '@hatohui/i18n';
import {
  getTravelCuisinesQueryKey,
  useBulkCreateTravelCuisines,
  useDeleteTravelCuisine,
  useTravelCountries,
  useTravelCuisines,
  useUpdateTravelCuisine,
  type TravelCuisineDto,
} from '@hatohui/models';
import type { EditableColumn } from '@hatohui/ui';
import { formatAddedDate } from '../lib/formatDate';
import { useAdminAction } from './useAdminAction';
import { useRowDeletion } from './useRowDeletion';

export interface CuisineRow {
  id: string;
  name: string;
  countryId: string;
  areaId: string;
  dishCount: number;
  createdAt: string;
}

type LocationKey = 'countryId' | 'areaId';

export function useAdminCuisines() {
  const { t } = useTranslation();
  const query = useTravelCuisines();
  const update = useUpdateTravelCuisine();
  const remove = useDeleteTravelCuisine();
  const bulk = useBulkCreateTravelCuisines();
  const { run, runBulk } = useAdminAction();

  const countries = useTravelCountries().data?.data ?? [];
  const areas = countries.flatMap((country) =>
    country.areas.map((area) => ({ ...area, countryId: country.id })),
  );
  const countryOptions = [
    { value: '', label: t('admin.noCountry') },
    ...countries.map((c) => ({ value: c.id, label: c.name })),
  ];
  const areaOptions = [
    { value: '', label: t('admin.noArea') },
    ...areas.map((a) => ({ value: a.id, label: a.name })),
  ];
  const nameOf = (options: { value: string; label: string }[], id: string) =>
    id ? (options.find((o) => o.value === id)?.label ?? '') : '';

  const rows: CuisineRow[] = (query.data?.data ?? []).map((cuisine) => ({
    ...cuisine,
    countryId: cuisine.countryId ?? '',
    areaId: cuisine.areaId ?? '',
  }));

  const locationPatch = (key: LocationKey, value: string) =>
    key === 'areaId'
      ? {
          areaId: value || null,
          ...(value && {
            countryId: areas.find((a) => a.id === value)?.countryId ?? null,
          }),
        }
      : { countryId: value || null, areaId: null };

  const columns: EditableColumn<CuisineRow>[] = [
    {
      key: 'name',
      label: t('admin.name'),
      editable: true,
      sortable: true,
      size: 240,
    },
    {
      key: 'countryId',
      label: t('admin.country'),
      editable: true,
      sortable: true,
      options: countryOptions,
      render: (row) => nameOf(countryOptions, row.countryId),
      size: 160,
    },
    {
      key: 'areaId',
      label: t('admin.area'),
      editable: true,
      sortable: true,
      options: areaOptions,
      render: (row) => nameOf(areaOptions, row.areaId),
      size: 160,
    },
    { key: 'dishCount', label: t('admin.dishes'), sortable: true, size: 100 },
    {
      key: 'createdAt',
      label: t('admin.added'),
      sortable: true,
      render: (row) => formatAddedDate(row.createdAt),
      size: 130,
    },
  ];

  const cuisinesQueryKey = getTravelCuisinesQueryKey();

  const deletion = useRowDeletion<CuisineRow>(
    (row) =>
      run<{ data: TravelCuisineDto[] }>(
        () => remove.mutateAsync({ id: row.id }),
        {
          queryKey: cuisinesQueryKey,
          apply: (current) => ({
            ...current,
            data: current.data.filter((item) => item.id !== row.id),
          }),
        },
      ),
    (row) => row.dishCount > 0,
  );

  return {
    rows,
    columns,
    isLoading: query.isLoading,
    deletion,
    commit: (id: string, key: keyof CuisineRow, value: string) => {
      const data =
        key === 'countryId' || key === 'areaId'
          ? locationPatch(key, value)
          : { name: value };
      void run<{ data: TravelCuisineDto[] }>(
        () => update.mutateAsync({ id, data }),
        {
          queryKey: cuisinesQueryKey,
          apply: (current) => ({
            ...current,
            data: current.data.map((item) =>
              item.id === id ? { ...item, ...data } : item,
            ),
          }),
        },
      );
    },
    add: (names: string[]) =>
      runBulk(() => bulk.mutateAsync({ data: { names } })),
  };
}
