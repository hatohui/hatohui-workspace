import { useTranslation } from '@hatohui/i18n';
import {
  getTravelDishesQueryKey,
  useBulkCreateTravelDishes,
  useDeleteTravelDish,
  useTravelCountries,
  useTravelDishes,
  useUpdateTravelDish,
  type TravelDishDto,
} from '@hatohui/models';
import type { EditableColumn } from '@hatohui/ui';
import { CUISINE_LIST_SEPARATOR } from '../constants/admin';
import { MAX_CUISINES } from '../constants/travel';
import { formatAddedDate } from '../lib/formatDate';
import { useAdminAction } from './useAdminAction';
import { useCuisineSuggestions } from './useCuisineSuggestions';
import { useRowDeletion } from './useRowDeletion';

export interface DishRow {
  id: string;
  name: string;
  cuisines: string;
  countryId: string;
  description: string;
  placeCount: number;
  createdAt: string;
}

const toCuisineList = (value: string) =>
  value
    .split(CUISINE_LIST_SEPARATOR)
    .map((name) => name.trim())
    .filter(Boolean);

export function useAdminDishes() {
  const { t } = useTranslation();
  const query = useTravelDishes();
  const update = useUpdateTravelDish();
  const remove = useDeleteTravelDish();
  const bulk = useBulkCreateTravelDishes();
  const suggestions = useCuisineSuggestions();
  const { run, runBulk } = useAdminAction();
  const countries = useTravelCountries().data?.data ?? [];
  const countryOptions = [
    { value: '', label: t('dishes.noCountry') },
    ...countries.map((c) => ({ value: c.id, label: c.name })),
  ];
  const countryOf = (id: string) => countries.find((c) => c.id === id) ?? null;

  const rows: DishRow[] = (query.data?.data ?? []).map((dish) => ({
    id: dish.id,
    name: dish.name,
    cuisines: dish.cuisines.join(`${CUISINE_LIST_SEPARATOR} `),
    countryId: dish.country?.id ?? '',
    description: dish.description ?? '',
    placeCount: dish.placeCount,
    createdAt: dish.createdAt,
  }));

  const columns: EditableColumn<DishRow>[] = [
    {
      key: 'name',
      label: t('admin.name'),
      editable: true,
      sortable: true,
      size: 200,
    },
    {
      key: 'cuisines',
      label: t('form.cuisines'),
      editable: true,
      sortable: true,
      suggestions,
      maxTags: MAX_CUISINES,
      selectPlaceholder: t('form.cuisinesPlaceholder'),
      createLabel: (tag) => t('form.cuisineCreate', { tag }),
      removeLabel: (tag) => t('form.cuisineRemove', { tag }),
      size: 200,
    },
    {
      key: 'countryId',
      label: t('dishes.country'),
      editable: true,
      sortable: true,
      options: countryOptions,
      render: (row) => countryOf(row.countryId)?.name ?? '',
      size: 150,
    },
    {
      key: 'description',
      label: t('dishes.description'),
      editable: true,
      sortable: true,
      size: 280,
    },
    {
      key: 'placeCount',
      label: t('admin.places'),
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

  const dishesQueryKey = getTravelDishesQueryKey();

  const commit = (id: string, key: keyof DishRow, value: string) =>
    void run<{ data: TravelDishDto[] }>(
      () =>
        update.mutateAsync({
          id,
          data:
            key === 'cuisines'
              ? { cuisines: toCuisineList(value) }
              : key === 'countryId'
                ? { countryId: value || null }
                : { [key]: value },
        }),
      {
        queryKey: dishesQueryKey,
        apply: (current) => ({
          ...current,
          data: current.data.map((dish) =>
            dish.id === id
              ? {
                  ...dish,
                  ...(key === 'cuisines'
                    ? { cuisines: toCuisineList(value) }
                    : key === 'countryId'
                      ? { country: countryOf(value) }
                      : { [key]: value }),
                }
              : dish,
          ),
        }),
      },
    );

  const deletion = useRowDeletion<DishRow>(
    (row) =>
      run<{ data: TravelDishDto[] }>(() => remove.mutateAsync({ id: row.id }), {
        queryKey: dishesQueryKey,
        apply: (current) => ({
          ...current,
          data: current.data.filter((dish) => dish.id !== row.id),
        }),
      }),
    (row) => row.placeCount > 0,
  );

  return {
    rows,
    columns,
    isLoading: query.isLoading,
    deletion,
    commit,
    add: (names: string[]) =>
      runBulk(() => bulk.mutateAsync({ data: { names } })),
  };
}
