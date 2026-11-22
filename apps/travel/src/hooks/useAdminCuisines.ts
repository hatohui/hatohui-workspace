import { useTranslation } from '@hatohui/i18n';
import {
  getTravelCuisinesQueryKey,
  useBulkCreateTravelCuisines,
  useDeleteTravelCuisine,
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

  const rows: CuisineRow[] = query.data?.data ?? [];

  const columns: EditableColumn<CuisineRow>[] = [
    {
      key: 'name',
      label: t('admin.name'),
      editable: true,
      sortable: true,
      size: 240,
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
    commit: (id: string, _key: keyof CuisineRow, value: string) =>
      void run<{ data: TravelCuisineDto[] }>(
        () => update.mutateAsync({ id, data: { name: value } }),
        {
          queryKey: cuisinesQueryKey,
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
