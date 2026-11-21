import { useTranslation } from '@hatohui/i18n';
import {
  useBulkCreateTravelCountries,
  useDeleteTravelCountry,
  useTravelCountries,
  useUpdateTravelCountry,
} from '@hatohui/models';
import type { EditableColumn } from '@hatohui/ui';
import { useAdminAction } from './useAdminAction';
import { useRowDeletion } from './useRowDeletion';

export interface CountryRow {
  id: string;
  name: string;
  code: string;
  areaCount: number;
  placeCount: number;
}

export function useAdminCountries() {
  const { t } = useTranslation();
  const query = useTravelCountries();
  const update = useUpdateTravelCountry();
  const remove = useDeleteTravelCountry();
  const bulk = useBulkCreateTravelCountries();
  const { run, runBulk } = useAdminAction();

  const rows: CountryRow[] = (query.data?.data ?? []).map((country) => ({
    id: country.id,
    name: country.name,
    code: country.code ?? '',
    areaCount: country.areas.length,
    placeCount: country.placeCount,
  }));

  const columns: EditableColumn<CountryRow>[] = [
    { key: 'name', label: t('admin.name'), editable: true, size: 220 },
    { key: 'code', label: t('admin.code'), editable: true, size: 100 },
    { key: 'areaCount', label: t('admin.areas'), size: 100 },
    { key: 'placeCount', label: t('admin.places'), size: 100 },
  ];

  const deletion = useRowDeletion<CountryRow>(
    (row) => run(() => remove.mutateAsync({ id: row.id })),
    (row) => row.areaCount > 0 || row.placeCount > 0,
  );

  return {
    rows,
    columns,
    isLoading: query.isLoading,
    deletion,
    commit: (id: string, key: keyof CountryRow, value: string) =>
      void run(() => update.mutateAsync({ id, data: { [key]: value } })),
    add: (names: string[]) =>
      runBulk(() => bulk.mutateAsync({ data: { names } })),
  };
}
