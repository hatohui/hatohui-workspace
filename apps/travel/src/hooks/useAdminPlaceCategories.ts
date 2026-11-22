import { useTranslation } from '@hatohui/i18n';
import {
  getTravelPlaceCategoriesQueryKey,
  useBulkCreateTravelPlaceCategories,
  useDeleteTravelPlaceCategory,
  useTravelPlaceCategories,
  useUpdateTravelPlaceCategory,
  type TravelPlaceCategoryDto,
} from '@hatohui/models';
import type { EditableColumn } from '@hatohui/ui';
import { formatAddedDate } from '../lib/formatDate';
import { useAdminAction } from './useAdminAction';
import { useRowDeletion } from './useRowDeletion';

export interface PlaceCategoryRow {
  id: string;
  name: string;
  placeCount: number;
  createdAt: string;
}

export function useAdminPlaceCategories() {
  const { t } = useTranslation();
  const query = useTravelPlaceCategories();
  const update = useUpdateTravelPlaceCategory();
  const remove = useDeleteTravelPlaceCategory();
  const bulk = useBulkCreateTravelPlaceCategories();
  const { run, runBulk } = useAdminAction();

  const rows: PlaceCategoryRow[] = query.data?.data ?? [];

  const columns: EditableColumn<PlaceCategoryRow>[] = [
    {
      key: 'name',
      label: t('admin.name'),
      editable: true,
      sortable: true,
      size: 240,
    },
    {
      key: 'placeCount',
      label: t('admin.places'),
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

  const categoriesQueryKey = getTravelPlaceCategoriesQueryKey();

  const deletion = useRowDeletion<PlaceCategoryRow>(
    (row) =>
      run<{ data: TravelPlaceCategoryDto[] }>(
        () => remove.mutateAsync({ id: row.id }),
        {
          queryKey: categoriesQueryKey,
          apply: (current) => ({
            ...current,
            data: current.data.filter((item) => item.id !== row.id),
          }),
        },
      ),
    (row) => row.placeCount > 0,
  );

  return {
    rows,
    columns,
    isLoading: query.isLoading,
    deletion,
    commit: (id: string, _key: keyof PlaceCategoryRow, value: string) =>
      void run<{ data: TravelPlaceCategoryDto[] }>(
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
