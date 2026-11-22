import { TravelEventVisibility } from '@prisma/client';

export const EVENT_CALENDAR_CACHE_TTL_SECONDS = 600;
export const DEFAULT_UPCOMING_EVENTS_LIMIT = 10;
export const DEFAULT_EVENTS_LIST_LIMIT = 100;
export const TRAVEL_EVENT_VISIBILITIES = [
  TravelEventVisibility.PUBLIC,
  TravelEventVisibility.PRIVATE,
] as const;
