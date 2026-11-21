import { useEffect, useState } from 'react';
import { useTravelCountries } from '@hatohui/models';
import { LOCATION_STORAGE_KEY } from '../constants/location';

interface Selection {
  countryId: string | null;
  areaId: string | null;
}

const EMPTY: Selection = { countryId: null, areaId: null };

function readStored(): Selection {
  try {
    const raw = window.localStorage.getItem(LOCATION_STORAGE_KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Selection) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function useTravelLocationState() {
  const [selection, setSelection] = useState<Selection>(readStored);
  const countries = useTravelCountries().data?.data ?? [];

  useEffect(() => {
    try {
      window.localStorage.setItem(
        LOCATION_STORAGE_KEY,
        JSON.stringify(selection),
      );
    } catch {
      // Remembering the location is a convenience; private mode can refuse it.
    }
  }, [selection]);

  const country = countries.find((c) => c.id === selection.countryId) ?? null;
  const area = country?.areas.find((a) => a.id === selection.areaId) ?? null;

  return {
    countries,
    country,
    area,
    setCountry: (countryId: string | null) =>
      setSelection({ countryId, areaId: null }),
    setArea: (areaId: string | null) =>
      setSelection((current) => ({ ...current, areaId })),
    filter: {
      countryId: area ? undefined : (country?.id ?? undefined),
      areaId: area?.id ?? undefined,
    },
  };
}

export type TravelLocation = ReturnType<typeof useTravelLocationState>;
