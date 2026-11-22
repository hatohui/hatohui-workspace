import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { useDebouncedValue } from '@hatohui/libs';
import type { TravelCatalogSort } from '@hatohui/models';
import {
  DEFAULT_CATALOG_SORT,
  FOOD_GROUP_CATEGORY,
  FOOD_GROUP_PARAM,
} from '../constants/food';
import { SEARCH_DEBOUNCE_MS } from '../constants/travel';
import { useSearchState } from './useSearchState';

const toggled = <T>(list: T[], item: T) =>
  list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

const listOrUndefined = <T>(list: T[]) => (list.length ? list : undefined);

export function useSpotFilterState() {
  const [params, setParams] = useSearchParams();
  const { search, setSearch, query } = useSearchState();
  const [includeSpecials, setIncludeSpecials] = useState<string[]>([]);
  const [excludeSpecials, setExcludeSpecials] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [spotCategories, setSpotCategories] = useState<string[]>([]);
  const [by, setBy] = useState('');
  const [sort, setSort] = useState<TravelCatalogSort>(DEFAULT_CATALOG_SORT);
  const debouncedBy = useDebouncedValue(by.trim(), SEARCH_DEBOUNCE_MS);
  const groupByCategory = params.get(FOOD_GROUP_PARAM) === FOOD_GROUP_CATEGORY;

  const toggleGroupByCategory = () => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (next.get(FOOD_GROUP_PARAM) === FOOD_GROUP_CATEGORY) {
          next.delete(FOOD_GROUP_PARAM);
        } else {
          next.set(FOOD_GROUP_PARAM, FOOD_GROUP_CATEGORY);
        }
        return next;
      },
      { replace: true },
    );
  };

  const cycleSpecial = (key: string) => {
    if (includeSpecials.includes(key)) {
      setIncludeSpecials((l) => l.filter((x) => x !== key));
      setExcludeSpecials((l) => (l.includes(key) ? l : [...l, key]));
    } else if (excludeSpecials.includes(key)) {
      setExcludeSpecials((l) => l.filter((x) => x !== key));
    } else {
      setIncludeSpecials((l) => [...l, key]);
    }
  };

  const activeCount =
    includeSpecials.length +
    excludeSpecials.length +
    tags.length +
    spotCategories.length +
    Number(Boolean(by.trim()));

  const clearFilters = () => {
    setSearch('');
    setIncludeSpecials([]);
    setExcludeSpecials([]);
    setTags([]);
    setSpotCategories([]);
    setBy('');
  };

  return {
    groupByCategory,
    toggleGroupByCategory,
    queryParams: {
      q: query,
      tags: listOrUndefined([...includeSpecials, ...tags]),
      excludeTags: listOrUndefined(excludeSpecials),
      spotCategories: listOrUndefined(spotCategories),
      by: debouncedBy || undefined,
      sort: sort === DEFAULT_CATALOG_SORT ? undefined : sort,
    },
    filters: {
      search,
      setSearch,
      includeSpecials,
      excludeSpecials,
      cycleSpecial,
      tags,
      toggleTag: (tag: string) => setTags((l) => toggled(l, tag)),
      spotCategories,
      toggleSpotCategory: (name: string) =>
        setSpotCategories((l) => toggled(l, name)),
      clearSpotCategories: () => setSpotCategories([]),
      by,
      setBy,
      activeCount,
      clearFilters,
      sort,
      setSort,
    },
    isFiltered: Boolean(query) || activeCount > 0,
  };
}

export type SpotFilterState = ReturnType<typeof useSpotFilterState>;
export type SpotFilters = SpotFilterState['filters'];
