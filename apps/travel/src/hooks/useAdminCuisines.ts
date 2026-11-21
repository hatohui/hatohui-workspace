import { useTranslation } from '@hatohui/i18n';
import {
  useBulkCreateTravelCuisines,
  useDeleteTravelCuisine,
  useTravelCuisines,
  useUpdateTravelCuisine,
} from '@hatohui/models';
import type { EditableColumn } from '@hatohui/ui';
import { useAdminAction } from './useAdminAction';
import { useRowDeletion } from './useRowDeletion';

export interface CuisineRow {
  id: string;
  name: string;
  dishCount: number;
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
    { key: 'name', label: t('admin.name'), editable: true, size: 240 },
    { key: 'dishCount', label: t('admin.dishes'), size: 100 },
  ];

  const deletion = useRowDeletion<CuisineRow>(
    (row) => run(() => remove.mutateAsync({ id: row.id })),
    (row) => row.dishCount > 0,
  );

  return {
    rows,
    columns,
    isLoading: query.isLoading,
    deletion,
    commit: (id: string, _key: keyof CuisineRow, value: string) =>
      void run(() => update.mutateAsync({ id, data: { name: value } })),
    add: (names: string[]) =>
      runBulk(() => bulk.mutateAsync({ data: { names } })),
  };
}
