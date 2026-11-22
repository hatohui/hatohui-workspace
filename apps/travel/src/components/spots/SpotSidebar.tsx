import type { SpotFilters as Filters } from '../../hooks/useSpotFilterState';
import SpotFilters from './SpotFilters';

function SpotSidebar({ filters }: { filters: Filters }) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto pr-1 pb-6 [scrollbar-width:thin]">
        <SpotFilters filters={filters} />
      </div>
    </aside>
  );
}

export default SpotSidebar;
