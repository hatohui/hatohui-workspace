import { useTranslation } from '@hatohui/i18n';
import {
  getTravelCuisinesQueryKey,
  useBulkCreateTravelCuisines,
  useDeleteTravelCuisine,
  useTravelCountries,
  useTravelCuisines,
  useUpdateTravelCuisine,
  type TravelCuisineDto,
  type UpdateTravelCuisineDto,
} from '@hatohui/models';
import type { EditableColumn } from '@hatohui/ui';
import { CUISINE_LIST_SEPARATOR } from '../constants/admin';
import { formatAddedDate } from '../lib/formatDate';
import { useAdminAction } from './useAdminAction';
import { useRowDeletion } from './useRowDeletion';

export interface CuisineRow {
  id: string;
  name: string;
  countries: string;
  areaId: string;
  dishCount: number;
  createdAt: string;
}

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
  const countryById = new Map(countries.map((c) => [c.id, c]));
  const countryIdByName = new Map(
    countries.map((c) => [c.name.toLowerCase(), c.id]),
  );
  const areaCountryOf = new Map(areas.map((a) => [a.id, a.countryId]));
  const countrySuggestions = countries.map((c) => ({
    value: c.name,
    hint: c.code ?? undefined,
  }));
  const areaOptions = [
    { value: '', label: t('admin.noArea') },
    ...areas.map((a) => ({ value: a.id, label: a.name })),
  ];
  const nameOf = (options: { value: string; label: string }[], id: string) =>
    id ? (options.find((o) => o.value === id)?.label ?? '') : '';

  const rows: CuisineRow[] = (query.data?.data ?? []).map((cuisine) => ({
    id: cuisine.id,
    name: cuisine.name,
    countries: cuisine.countryIds
      .map((id) => countryById.get(id)?.name)
      .filter((name): name is string => Boolean(name))
      .join(`${CUISINE_LIST_SEPARATOR} `),
    areaId: cuisine.areaId ?? '',
    dishCount: cuisine.dishCount,
    createdAt: cuisine.createdAt,
  }));

  const columns: EditableColumn<CuisineRow>[] = [
    {
      key: 'name',
      label: t('admin.name'),
      editable: true,
      sortable: true,
      size: 240,
    },
    {
      key: 'countries',
      label: t('admin.countries'),
      editable: true,
      sortable: true,
      suggestions: countrySuggestions,
      allowCreate: false,
      selectPlaceholder: t('admin.countriesPlaceholder'),
      removeLabel: (tag) => t('form.tagRemove', { tag }),
      size: 220,
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
      let data: UpdateTravelCuisineDto;
      if (key === 'countries') {
        const names = value
          .split(CUISINE_LIST_SEPARATOR)
          .map((item) => item.trim().toLowerCase())
          .filter(Boolean);
        const countryIds = [
          ...new Set(
            names
              .map((name) => countryIdByName.get(name))
              .filter((cid): cid is string => Boolean(cid)),
          ),
        ];
        data = { countryIds };
      } else if (key === 'areaId') {
        data = { areaId: value || null };
      } else {
        data = { name: value };
      }

      void run<{ data: TravelCuisineDto[] }>(
        () => update.mutateAsync({ id, data }),
        {
          queryKey: cuisinesQueryKey,
          apply: (current) => ({
            ...current,
            data: current.data.map((item) => {
              if (item.id !== id) return item;
              if (data.countryIds !== undefined) {
                const areaCountry = item.areaId
                  ? areaCountryOf.get(item.areaId)
                  : undefined;
                const keepArea =
                  areaCountry !== undefined &&
                  data.countryIds.includes(areaCountry);
                return {
                  ...item,
                  countryIds: data.countryIds,
                  areaId: keepArea ? item.areaId : null,
                };
              }
              if (data.areaId !== undefined) {
                const areaCountry = data.areaId
                  ? areaCountryOf.get(data.areaId)
                  : undefined;
                const nextCountryIds =
                  areaCountry && !item.countryIds.includes(areaCountry)
                    ? [...item.countryIds, areaCountry]
                    : item.countryIds;
                return {
                  ...item,
                  areaId: data.areaId,
                  countryIds: nextCountryIds,
                };
              }
              return { ...item, name: data.name ?? item.name };
            }),
          }),
        },
      );
    },
    add: (names: string[]) =>
      runBulk(() => bulk.mutateAsync({ data: { names } })),
  };
}
