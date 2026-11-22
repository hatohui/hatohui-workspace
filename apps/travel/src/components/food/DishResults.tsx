import { useTranslation } from '@hatohui/i18n';
import { Soup } from 'lucide-react';
import type { useDishList } from '../../hooks/useDishList';
import ClearFiltersButton from '../catalog/ClearFiltersButton';
import DishCard from '../dishes/DishCard';
import { CARD_GRID_CLASS } from '../../constants/travel';
import ListState from '../shared/ListState';

interface Props {
  list: ReturnType<typeof useDishList>;
  isFiltered: boolean;
  onClearFilters: () => void;
}

function DishResults({ list, isFiltered, onClearFilters }: Props) {
  const { t } = useTranslation();
  return (
    <ListState
      isLoading={list.isLoading}
      isError={list.isError}
      isEmpty={!list.dishes.length}
      onRetry={() => void list.refetch()}
      emptyIcon={Soup}
      emptyMessage={t(isFiltered ? 'catalog.emptyFiltered' : 'dishes.empty')}
      emptyAction={
        isFiltered && <ClearFiltersButton onClick={onClearFilters} />
      }
    >
      <div className={CARD_GRID_CLASS}>
        {list.dishes.map((dish) => (
          <DishCard key={dish.id} dish={dish} />
        ))}
      </div>
    </ListState>
  );
}

export default DishResults;
