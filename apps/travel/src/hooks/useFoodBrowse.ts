import { FOOD_VIEW_OPTIONS } from '../constants/food';
import { useDishList } from './useDishList';
import { useFoodView } from './useFoodView';
import { usePlaceList } from './usePlaceList';
import { useTravelFilterState } from './useTravelFilterState';

export function useFoodBrowse() {
  const { view, setView } = useFoodView();
  const filterState = useTravelFilterState();
  const dishes = useDishList(filterState, view === 'dishes');
  const places = usePlaceList(filterState, view === 'places');

  return {
    view,
    setView,
    searchKey: FOOD_VIEW_OPTIONS[view].searchKey,
    filters: filterState.filters,
    isFiltered: filterState.isFiltered,
    dishes,
    places,
    active: view === 'dishes' ? dishes : places,
  };
}
