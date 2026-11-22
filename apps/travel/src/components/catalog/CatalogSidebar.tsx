import type { FoodView } from '../../constants/food';
import type { CatalogFilters as Filters } from '../../hooks/useTravelFilterState';
import CatalogFilters from './CatalogFilters';

function CatalogSidebar({
  filters,
  view,
}: {
  filters: Filters;
  view?: FoodView;
}) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto pr-1 pb-6 [scrollbar-width:thin]">
        <CatalogFilters filters={filters} view={view} />
      </div>
    </aside>
  );
}

export default CatalogSidebar;
