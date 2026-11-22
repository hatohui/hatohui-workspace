import { useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { useTravelCountries } from '@hatohui/models';
import {
  LOCATION_AREA_PARAM,
  LOCATION_COUNTRY_PARAM,
  LOCATION_STORAGE_KEY,
} from '../constants/location';

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

function writeStored(selection: Selection) {
  try {
    window.localStorage.setItem(
      LOCATION_STORAGE_KEY,
      JSON.stringify(selection),
    );
  } catch {
    // Remembering the location is a convenience; private mode can refuse it.
  }
}

function withSelection(prev: URLSearchParams, selection: Selection) {
  const updated = new URLSearchParams(prev);
  if (selection.countryId) {
    updated.set(LOCATION_COUNTRY_PARAM, selection.countryId);
  } else {
    updated.delete(LOCATION_COUNTRY_PARAM);
  }
  if (selection.countryId && selection.areaId) {
    updated.set(LOCATION_AREA_PARAM, selection.areaId);
  } else {
    updated.delete(LOCATION_AREA_PARAM);
  }
  return updated;
}

export function useTravelLocationState() {
  const [params, setParams] = useSearchParams();
  const countries = useTravelCountries().data?.data ?? [];
  const urlCountryId = params.get(LOCATION_COUNTRY_PARAM);
  const urlAreaId = params.get(LOCATION_AREA_PARAM);
  const selection: Selection = urlCountryId
    ? { countryId: urlCountryId, areaId: urlAreaId }
    : readStored();

  useEffect(() => {
    if (urlCountryId) {
      writeStored({ countryId: urlCountryId, areaId: urlAreaId });
      return;
    }
    const stored = readStored();
    if (stored.countryId) {
      setParams((prev) => withSelection(prev, stored), { replace: true });
    }
  }, [urlCountryId, urlAreaId, setParams]);

  const select = (next: Selection) => {
    writeStored(next);
    setParams((prev) => withSelection(prev, next), { replace: true });
  };

  const country = countries.find((c) => c.id === selection.countryId) ?? null;
  const area = country?.areas.find((a) => a.id === selection.areaId) ?? null;
  const areaId = countries.length ? area?.id : (selection.areaId ?? undefined);

  return {
    countries,
    country,
    area,
    setCountry: (countryId: string | null) =>
      select({ countryId, areaId: null }),
    setArea: (areaId: string | null) =>
      select({ countryId: selection.countryId, areaId }),
    filter: {
      countryId: areaId ? undefined : (selection.countryId ?? undefined),
      areaId,
    },
  };
}

export type TravelLocation = ReturnType<typeof useTravelLocationState>;
