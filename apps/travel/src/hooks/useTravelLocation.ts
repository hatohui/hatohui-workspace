import { useContext } from 'react';
import { TravelLocationContext } from './travelLocationContext';
import type { TravelLocation } from './useTravelLocationState';

export function useTravelLocation(): TravelLocation {
  const location = useContext(TravelLocationContext);
  if (!location) {
    throw new Error(
      'useTravelLocation must be used within TravelLocationProvider',
    );
  }
  return location;
}
