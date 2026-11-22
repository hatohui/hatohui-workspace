import { useTranslation } from '@hatohui/i18n';
import {
  getTravelSpotCategoriesQueryKey,
  useBulkCreateTravelSpotCategories,
  useDeleteTravelSpotCategory,
  useTravelSpotCategories,
  useUpdateTravelSpotCategory,
  type TravelSpotCategoryDto,
} from '@hatohui/models';
import type { EditableColumn } from '@hatohui/ui';
import { formatAddedDate } from '../lib/formatDate';
import { useAdminAction } from './useAdminAction';
import { useRowDeletion } from './useRowDeletion';

export interface SpotCategoryRow {
  id: string;
  name: string;
  spotCount: number;
  createdAt: string;
}

export function useAdminSpotCategories() {
  const { t } = useTranslation();
  const query = useTravelSpotCategories();
  const update = useUpdateTravelSpotCategory();
  const remove = useDeleteTravelSpotCategory();
  const bulk = useBulkCreateTravelSpotCategories();
  const { run, runBulk } = useAdminAction();

  const rows: SpotCategoryRow[] = query.data?.data ?? [];

  const columns: EditableColumn<SpotCategoryRow>[] = [
    {
      key: 'name',
      label: t('admin.name'),
      editable: true,
      sortable: true,
      size: 240,
    },
    {
      key: 'spotCount',
      label: t('admin.spots'),
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

  const categoriesQueryKey = getTravelSpotCategoriesQueryKey();

  const deletion = useRowDeletion<SpotCategoryRow>(
    (row) =>
      run<{ data: TravelSpotCategoryDto[] }>(
        () => remove.mutateAsync({ id: row.id }),
        {
          queryKey: categoriesQueryKey,
          apply: (current) => ({
            ...current,
            data: current.data.filter((item) => item.id !== row.id),
          }),
        },
      ),
    (row) => row.spotCount > 0,
  );

  return {
    rows,
    columns,
    isLoading: query.isLoading,
    deletion,
    commit: (id: string, _key: keyof SpotCategoryRow, value: string) =>
      void run<{ data: TravelSpotCategoryDto[] }>(
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
