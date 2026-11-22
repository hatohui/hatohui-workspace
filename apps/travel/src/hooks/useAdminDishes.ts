import { useTranslation } from '@hatohui/i18n';
import {
  getTravelDishesQueryKey,
  useBulkCreateTravelDishes,
  useDeleteTravelDish,
  useTravelDishes,
  useUpdateTravelDish,
  type TravelDishDto,
} from '@hatohui/models';
import type { EditableColumn } from '@hatohui/ui';
import { CUISINE_LIST_SEPARATOR } from '../constants/admin';
import { MAX_CATEGORIES, MAX_CUISINES } from '../constants/travel';
import { formatAddedDate } from '../lib/formatDate';
import { useAdminAction } from './useAdminAction';
import { useAdminDishPhotos } from './useAdminDishPhotos';
import { useCuisineSuggestions } from './useCuisineSuggestions';
import { useFoodCategorySuggestions } from './useFoodCategorySuggestions';
import { useRowDeletion } from './useRowDeletion';

export interface DishRow {
  id: string;
  thumbnailUrl: string | null;
  name: string;
  cuisines: string;
  categories: string;
  description: string;
  placeCount: number;
  createdAt: string;
}

const toTagList = (value: string) =>
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
  const categorySuggestions = useFoodCategorySuggestions();
  const { run, runBulk } = useAdminAction();
  const photo = useAdminDishPhotos(run);

  const rows: DishRow[] = (query.data?.data ?? []).map((dish) => ({
    id: dish.id,
    thumbnailUrl: dish.thumbnailUrl ?? dish.imageUrl ?? null,
    name: dish.name,
    cuisines: dish.cuisines.join(`${CUISINE_LIST_SEPARATOR} `),
    categories: dish.categories.join(`${CUISINE_LIST_SEPARATOR} `),
    description: dish.description ?? '',
    placeCount: dish.placeCount,
    createdAt: dish.createdAt,
  }));

  const columns: EditableColumn<DishRow>[] = [
    {
      key: 'thumbnailUrl',
      label: t('admin.photo'),
      fixed: true,
      size: 76,
    },
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
      selectPlaceholder: t('form.foodCategoriesPlaceholder'),
      createLabel: (tag) => t('form.categoryCreate', { tag }),
      removeLabel: (tag) => t('form.categoryRemove', { tag }),
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

  const commit = (id: string, key: keyof DishRow, value: string) => {
    const patch =
      key === 'cuisines' || key === 'categories'
        ? { [key]: toTagList(value) }
        : { [key]: value };
    void run<{ data: TravelDishDto[] }>(
      () => update.mutateAsync({ id, data: patch }),
      {
        queryKey: dishesQueryKey,
        apply: (current) => ({
          ...current,
          data: current.data.map((dish) =>
            dish.id === id ? { ...dish, ...patch } : dish,
          ),
        }),
      },
    );
  };

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
    photo,
  };
}
