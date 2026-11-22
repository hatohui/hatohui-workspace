import { useTranslation } from '@hatohui/i18n';
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
  const { t } = useTranslation();

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-20 max-h-[calc(100dvh-6rem)] space-y-4 overflow-y-auto rounded-xl border border-border bg-card p-4 [scrollbar-width:thin]">
        <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2.5">
          <h2 className="text-sm font-medium">{t('filters.title')}</h2>
          {filters.activeCount > 0 && (
            <button
              type="button"
              onClick={filters.clearFilters}
              className="cursor-pointer text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {t('catalog.clearFilters')}
            </button>
          )}
        </div>
        <CatalogFilters filters={filters} view={view} hideClear />
      </div>
    </aside>
  );
}

export default CatalogSidebar;
