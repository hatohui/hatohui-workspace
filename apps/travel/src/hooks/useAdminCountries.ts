import { useTranslation } from '@hatohui/i18n';
import {
  getTravelCountriesQueryKey,
  useBulkCreateTravelCountries,
  useDeleteTravelCountry,
  useTravelCountries,
  useUpdateTravelCountry,
  type TravelCountryDto,
} from '@hatohui/models';
import type { EditableColumn } from '@hatohui/ui';
import { formatAddedDate } from '../lib/formatDate';
import { useAdminAction } from './useAdminAction';
import { useRowDeletion } from './useRowDeletion';

export interface CountryRow {
  id: string;
  name: string;
  code: string;
  areaCount: number;
  placeCount: number;
  createdAt: string;
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
    createdAt: country.createdAt,
  }));

  const columns: EditableColumn<CountryRow>[] = [
    {
      key: 'name',
      label: t('admin.name'),
      editable: true,
      sortable: true,
      size: 220,
    },
    {
      key: 'code',
      label: t('admin.code'),
      editable: true,
      sortable: true,
      size: 100,
    },
    {
      key: 'areaCount',
      label: t('admin.areas'),
      sortable: true,
      size: 100,
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

  const countriesQueryKey = getTravelCountriesQueryKey();

  const deletion = useRowDeletion<CountryRow>(
    (row) =>
      run<{ data: TravelCountryDto[] }>(
        () => remove.mutateAsync({ id: row.id }),
        {
          queryKey: countriesQueryKey,
          apply: (current) => ({
            ...current,
            data: current.data.filter((item) => item.id !== row.id),
          }),
        },
      ),
    (row) => row.areaCount > 0 || row.placeCount > 0,
  );

  return {
    rows,
    columns,
    isLoading: query.isLoading,
    deletion,
    commit: (id: string, key: keyof CountryRow, value: string) =>
      void run<{ data: TravelCountryDto[] }>(
        () => update.mutateAsync({ id, data: { [key]: value } }),
        {
          queryKey: countriesQueryKey,
          apply: (current) => ({
            ...current,
            data: current.data.map((item) =>
              item.id === id ? { ...item, [key]: value } : item,
            ),
          }),
        },
      ),
    add: (names: string[]) =>
      runBulk(() => bulk.mutateAsync({ data: { names } })),
  };
}
