import type { CatalogFilters as Filters } from '../../hooks/useTravelFilterState';
import CatalogFilters from './CatalogFilters';

function CatalogSidebar({ filters }: { filters: Filters }) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto pr-2 pb-6">
        <CatalogFilters filters={filters} />
      </div>
    </aside>
  );
}

export default CatalogSidebar;
