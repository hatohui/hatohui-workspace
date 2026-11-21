import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import {
  getTravelCountriesQueryKey,
  useBulkCreateTravelAreas,
  useDeleteTravelArea,
  useTravelCountries,
  useUpdateTravelArea,
  type TravelAreaDto,
  type TravelCountryDto,
} from '@hatohui/models';
import type { EditableColumn } from '@hatohui/ui';
import { useAdminAction } from './useAdminAction';
import { useRowDeletion } from './useRowDeletion';
import { useTravelLocation } from './useTravelLocation';

export interface AreaRow {
  id: string;
  name: string;
  countryId: string;
  placeCount: number;
}

export function useAdminAreas() {
  const { t } = useTranslation();
  const location = useTravelLocation();
  const query = useTravelCountries();
  const update = useUpdateTravelArea();
  const remove = useDeleteTravelArea();
  const bulk = useBulkCreateTravelAreas();
  const { run, runBulk } = useAdminAction();
  const countries = query.data?.data ?? [];
  const [picked, setPicked] = useState<string | null>(null);
  const targetCountryId =
    picked ?? location.country?.id ?? countries[0]?.id ?? '';

  const rows: AreaRow[] = countries.flatMap((country) =>
    country.areas.map((area) => ({
      id: area.id,
      name: area.name,
      countryId: area.countryId,
      placeCount: area.placeCount,
    })),
  );
  const countryOptions = countries.map((c) => ({ value: c.id, label: c.name }));

  const columns: EditableColumn<AreaRow>[] = [
    { key: 'name', label: t('admin.name'), editable: true, size: 220 },
    {
      key: 'countryId',
      label: t('location.country'),
      editable: true,
      options: countryOptions,
      render: (row) =>
        countries.find((c) => c.id === row.countryId)?.name ?? '',
      size: 180,
    },
    { key: 'placeCount', label: t('admin.places'), size: 100 },
  ];

  const countriesQueryKey = getTravelCountriesQueryKey();

  const deletion = useRowDeletion<AreaRow>(
    (row) =>
      run<{ data: TravelCountryDto[] }>(
        () => remove.mutateAsync({ id: row.id }),
        {
          queryKey: countriesQueryKey,
          apply: (current) => ({
            ...current,
            data: current.data.map((country) => ({
              ...country,
              areas: country.areas.filter((area) => area.id !== row.id),
            })),
          }),
        },
      ),
    (row) => row.placeCount > 0,
  );

  return {
    rows,
    columns,
    countryOptions,
    targetCountryId,
    setTargetCountryId: setPicked,
    isLoading: query.isLoading,
    deletion,
    commit: (id: string, key: keyof AreaRow, value: string) =>
      void run<{ data: TravelCountryDto[] }>(
        () => update.mutateAsync({ id, data: { [key]: value } }),
        {
          queryKey: countriesQueryKey,
          apply: (current) => {
            let moved: TravelAreaDto | undefined;
            if (key === 'countryId') {
              for (const country of current.data) {
                const match = country.areas.find((area) => area.id === id);
                if (match) {
                  moved = { ...match, countryId: value };
                  break;
                }
              }
            }
            return {
              ...current,
              data: current.data.map((country) => {
                if (key !== 'countryId') {
                  return {
                    ...country,
                    areas: country.areas.map((area) =>
                      area.id === id ? { ...area, [key]: value } : area,
                    ),
                  };
                }
                const without = country.areas.filter((area) => area.id !== id);
                return moved && country.id === value
                  ? { ...country, areas: [...without, moved] }
                  : { ...country, areas: without };
              }),
            };
          },
        },
      ),
    add: (names: string[]) =>
      runBulk(() =>
        bulk.mutateAsync({ data: { countryId: targetCountryId, names } }),
      ),
  };
}
