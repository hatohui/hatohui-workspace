import { useState } from 'react';
import { useDebouncedValue } from '@hatohui/libs';
import type { TravelCatalogSort } from '@hatohui/models';
import { DEFAULT_CATALOG_SORT } from '../constants/food';
import { SEARCH_DEBOUNCE_MS } from '../constants/travel';
import { useMyAllergies } from './useMyAllergies';
import { useSearchState } from './useSearchState';

const toggled = <T>(list: T[], item: T) =>
  list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

const listOrUndefined = <T>(list: T[]) => (list.length ? list : undefined);

export function useTravelFilterState() {
  const { search, setSearch, query } = useSearchState();
  const [includeSpecials, setIncludeSpecials] = useState<string[]>([]);
  const [excludeSpecials, setExcludeSpecials] = useState<string[]>([]);
  const [avoid, setAvoid] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [foodCategories, setFoodCategories] = useState<string[]>([]);
  const [placeCategories, setPlaceCategories] = useState<string[]>([]);
  const [by, setBy] = useState('');
  const [hideMine, setHideMine] = useState(false);
  const [sort, setSort] = useState<TravelCatalogSort>(DEFAULT_CATALOG_SORT);
  const mine = useMyAllergies();
  const excluded = hideMine
    ? [...new Set([...avoid, ...mine.allergens])]
    : avoid;
  const debouncedBy = useDebouncedValue(by.trim(), SEARCH_DEBOUNCE_MS);

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
    avoid.length +
    tags.length +
    cuisines.length +
    foodCategories.length +
    placeCategories.length +
    Number(Boolean(by.trim())) +
    Number(hideMine);

  const clearFilters = () => {
    setSearch('');
    setIncludeSpecials([]);
    setExcludeSpecials([]);
    setAvoid([]);
    setTags([]);
    setCuisines([]);
    setFoodCategories([]);
    setPlaceCategories([]);
    setBy('');
    setHideMine(false);
  };

  return {
    queryParams: {
      q: query,
      excludeAllergens: listOrUndefined(excluded),
      tags: listOrUndefined([...includeSpecials, ...tags]),
      excludeTags: listOrUndefined(excludeSpecials),
      cuisines: listOrUndefined(cuisines),
      foodCategories: listOrUndefined(foodCategories),
      placeCategories: listOrUndefined(placeCategories),
      by: debouncedBy || undefined,
      sort: sort === DEFAULT_CATALOG_SORT ? undefined : sort,
    },
    filters: {
      search,
      setSearch,
      includeSpecials,
      excludeSpecials,
      cycleSpecial,
      avoid,
      toggleAvoid: (tag: string) => setAvoid((l) => toggled(l, tag)),
      tags,
      toggleTag: (tag: string) => setTags((l) => toggled(l, tag)),
      cuisines,
      toggleCuisine: (name: string) => setCuisines((l) => toggled(l, name)),
      foodCategories,
      toggleFoodCategory: (name: string) =>
        setFoodCategories((l) => toggled(l, name)),
      clearFoodCategories: () => setFoodCategories([]),
      placeCategories,
      togglePlaceCategory: (name: string) =>
        setPlaceCategories((l) => toggled(l, name)),
      by,
      setBy,
      hideMine,
      setHideMine,
      myAllergenCount: mine.allergens.length,
      activeCount,
      clearFilters,
      sort,
      setSort,
    },
    isFiltered: Boolean(query) || activeCount > 0,
  };
}

export type TravelFilterState = ReturnType<typeof useTravelFilterState>;
export type CatalogFilters = TravelFilterState['filters'];
