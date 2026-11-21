import { createContext } from 'react';
import type { TravelLocation } from './useTravelLocationState';

export const TravelLocationContext = createContext<TravelLocation | null>(null);
