import { useTranslation } from '@hatohui/i18n';
import { Soup } from 'lucide-react';
import { CARD_GRID_CLASS } from '../../constants/travel';
import type { useDishList } from '../../hooks/useDishList';
import { groupByCategory } from '../../lib/groupByCategory';
import ClearFiltersButton from '../catalog/ClearFiltersButton';
import DishCard from '../dishes/DishCard';
import ListState from '../shared/ListState';
import CategoryGroupList from './CategoryGroupList';

interface Props {
  list: ReturnType<typeof useDishList>;
  groupByCategory: boolean;
  activeCategories: string[];
  isFiltered: boolean;
  onClearFilters: () => void;
}

function DishResults({
  list,
  groupByCategory: isGrouped,
  activeCategories,
  isFiltered,
  onClearFilters,
}: Props) {
  const { t } = useTranslation();
  const groups = isGrouped
    ? groupByCategory(
        list.allDishes,
        (dish) => dish.categories,
        activeCategories,
        t('catalog.uncategorized'),
      )
    : [];

  return (
    <ListState
      isLoading={list.isLoading}
      isError={list.isError}
      isEmpty={!(isGrouped ? list.allDishes.length : list.dishes.length)}
      onRetry={() => void list.refetch()}
      emptyIcon={Soup}
      emptyMessage={t(isFiltered ? 'catalog.emptyFiltered' : 'dishes.empty')}
      emptyAction={
        isFiltered && <ClearFiltersButton onClick={onClearFilters} />
      }
    >
      {isGrouped ? (
        <CategoryGroupList
          groups={groups}
          renderItem={(dish) => <DishCard dish={dish} />}
        />
      ) : (
        <div className={CARD_GRID_CLASS}>
          {list.dishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} />
          ))}
        </div>
      )}
    </ListState>
  );
}

export default DishResults;
