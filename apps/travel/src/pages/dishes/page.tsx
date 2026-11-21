import { useTranslation } from '@hatohui/i18n';
import { Soup } from 'lucide-react';
import DishCard from '../../components/dishes/DishCard';
import ListState from '../../components/shared/ListState';
import PageHeading from '../../components/shared/PageHeading';
import SearchField from '../../components/shared/SearchField';
import { useDishList } from '../../hooks/useDishList';

function DishesPage() {
  const { t } = useTranslation();
  const list = useDishList();

  return (
    <div className="space-y-6">
      <PageHeading title={t('dishes.title')} subtitle={t('dishes.subtitle')} />
      <SearchField
        value={list.search}
        placeholder={t('dishes.searchPlaceholder')}
        onChange={list.setSearch}
        suggestions={list.suggestions}
      />
      <ListState
        isLoading={list.isLoading}
        isError={list.isError}
        isEmpty={!list.dishes.length}
        onRetry={() => void list.refetch()}
        emptyIcon={Soup}
        emptyMessage={t('dishes.empty')}
      >
        <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {list.dishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} />
          ))}
        </div>
      </ListState>
    </div>
  );
}

export default DishesPage;
