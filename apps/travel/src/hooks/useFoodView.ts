import { useSearchParams } from 'react-router';
import {
  DEFAULT_FOOD_VIEW,
  FOOD_GROUP_CATEGORY,
  FOOD_GROUP_PARAM,
  FOOD_VIEWS,
  FOOD_VIEW_PARAM,
  type FoodView,
} from '../constants/food';

export function useFoodView() {
  const [params, setParams] = useSearchParams();
  const raw = params.get(FOOD_VIEW_PARAM);
  const view = FOOD_VIEWS.find((item) => item === raw) ?? DEFAULT_FOOD_VIEW;
  const groupByCategory = params.get(FOOD_GROUP_PARAM) === FOOD_GROUP_CATEGORY;

  const setView = (next: FoodView) =>
    setParams(
      (prev) => {
        const updated = new URLSearchParams(prev);
        updated.set(FOOD_VIEW_PARAM, next);
        return updated;
      },
      { replace: true },
    );

  const toggleGroupByCategory = () =>
    setParams(
      (prev) => {
        const updated = new URLSearchParams(prev);
        if (updated.get(FOOD_GROUP_PARAM) === FOOD_GROUP_CATEGORY) {
          updated.delete(FOOD_GROUP_PARAM);
        } else {
          updated.set(FOOD_GROUP_PARAM, FOOD_GROUP_CATEGORY);
        }
        return updated;
      },
      { replace: true },
    );

  return { view, setView, groupByCategory, toggleGroupByCategory };
}
