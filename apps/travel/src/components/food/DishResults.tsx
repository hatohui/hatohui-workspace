import { useTranslation } from '@hatohui/i18n';
import { Soup } from 'lucide-react';
import type { useDishList } from '../../hooks/useDishList';
import ClearFiltersButton from '../catalog/ClearFiltersButton';
import DishCard from '../dishes/DishCard';
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
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-5 sm:gap-y-8 lg:grid-cols-3">
        {list.dishes.map((dish) => (
          <DishCard key={dish.id} dish={dish} />
        ))}
      </div>
    </ListState>
  );
}

export default DishResults;
