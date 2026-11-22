import { useTravelLocation } from './useTravelLocation';

export function useHasAreas(): boolean {
  const { countries } = useTravelLocation();
  return countries.some((country) => country.areas.length > 0);
}
