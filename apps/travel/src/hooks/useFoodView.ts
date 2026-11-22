import { useSearchParams } from 'react-router';
import {
  DEFAULT_FOOD_VIEW,
  FOOD_VIEWS,
  FOOD_VIEW_PARAM,
  type FoodView,
} from '../constants/food';

export function useFoodView() {
  const [params, setParams] = useSearchParams();
  const raw = params.get(FOOD_VIEW_PARAM);
  const view = FOOD_VIEWS.find((item) => item === raw) ?? DEFAULT_FOOD_VIEW;

  const setView = (next: FoodView) =>
    setParams(
      (prev) => {
        const updated = new URLSearchParams(prev);
        updated.set(FOOD_VIEW_PARAM, next);
        return updated;
      },
      { replace: true },
    );

  return { view, setView };
}
