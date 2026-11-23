import type { DishLine } from '../../hooks/useRecommendationFields';
import CuisineField from '../shared/CuisineField';
import FoodCategoryField from '../shared/FoodCategoryField';

interface Props {
  line: DishLine;
  onChange: (patch: Partial<DishLine>) => void;
}

function DishLineNewFields({ line, onChange }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <CuisineField
        id={`dish-cuisines-${line.key}`}
        value={line.cuisines}
        onChange={(cuisines) => onChange({ cuisines })}
      />
      <FoodCategoryField
        id={`dish-categories-${line.key}`}
        value={line.foodCategories}
        onChange={(foodCategories) => onChange({ foodCategories })}
      />
    </div>
  );
}

export default DishLineNewFields;
