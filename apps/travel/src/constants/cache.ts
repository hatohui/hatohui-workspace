import {
  getTravelCuisinesQueryKey,
  getTravelTagsQueryKey,
} from '@hatohui/models';

export const QUERY_CACHE_STORAGE_KEY = 'travel:query-cache';
export const QUERY_CACHE_BUSTER = '1';
export const QUERY_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
export const CATALOG_OPTIONS_STALE_TIME_MS = 60 * 60 * 1000;

export const PERSISTED_QUERY_KEYS: readonly string[] = [
  getTravelTagsQueryKey()[0],
  getTravelCuisinesQueryKey()[0],
];
