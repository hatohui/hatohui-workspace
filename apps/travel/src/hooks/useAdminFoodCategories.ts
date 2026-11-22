import { useTranslation } from '@hatohui/i18n';
import {
  getTravelFoodCategoriesQueryKey,
  useBulkCreateTravelFoodCategories,
  useDeleteTravelFoodCategory,
  useTravelFoodCategories,
  useUpdateTravelFoodCategory,
  type TravelFoodCategoryDto,
} from '@hatohui/models';
import type { EditableColumn } from '@hatohui/ui';
import { formatAddedDate } from '../lib/formatDate';
import { useAdminAction } from './useAdminAction';
import { useRowDeletion } from './useRowDeletion';

export interface FoodCategoryRow {
  id: string;
  name: string;
  dishCount: number;
  createdAt: string;
}

export function useAdminFoodCategories() {
  const { t } = useTranslation();
  const query = useTravelFoodCategories();
  const update = useUpdateTravelFoodCategory();
  const remove = useDeleteTravelFoodCategory();
  const bulk = useBulkCreateTravelFoodCategories();
  const { run, runBulk } = useAdminAction();

  const rows: FoodCategoryRow[] = query.data?.data ?? [];

  const columns: EditableColumn<FoodCategoryRow>[] = [
    {
      key: 'name',
      label: t('admin.name'),
      editable: true,
      sortable: true,
      size: 240,
    },
    {
      key: 'dishCount',
      label: t('admin.dishes'),
      sortable: true,
      size: 100,
    },
    {
      key: 'createdAt',
      label: t('admin.added'),
      sortable: true,
      render: (row) => formatAddedDate(row.createdAt),
      size: 130,
    },
  ];

  const categoriesQueryKey = getTravelFoodCategoriesQueryKey();

  const deletion = useRowDeletion<FoodCategoryRow>(
    (row) =>
      run<{ data: TravelFoodCategoryDto[] }>(
        () => remove.mutateAsync({ id: row.id }),
        {
          queryKey: categoriesQueryKey,
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
    commit: (id: string, _key: keyof FoodCategoryRow, value: string) =>
      void run<{ data: TravelFoodCategoryDto[] }>(
        () => update.mutateAsync({ id, data: { name: value } }),
        {
          queryKey: categoriesQueryKey,
          apply: (current) => ({
            ...current,
            data: current.data.map((item) =>
              item.id === id ? { ...item, name: value } : item,
            ),
          }),
        },
      ),
    add: (names: string[]) =>
      runBulk(() => bulk.mutateAsync({ data: { names } })),
  };
}
