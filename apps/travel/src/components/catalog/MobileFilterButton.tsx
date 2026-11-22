import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import {
  Button,
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@hatohui/ui';
import { SlidersHorizontal } from 'lucide-react';
import type { FoodView } from '../../constants/food';
import type { CatalogFilters as Filters } from '../../hooks/useTravelFilterState';
import CatalogFilters from './CatalogFilters';

function MobileFilterButton({
  filters,
  view,
}: {
  filters: Filters;
  view?: FoodView;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-9 shrink-0 lg:hidden"
        onClick={() => setOpen(true)}
      >
        <SlidersHorizontal />
        {t('filters.title')}
        {filters.activeCount > 0 && (
          <span className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground tabular-nums">
            {filters.activeCount}
          </span>
        )}
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent closeLabel={t('common:back')}>
          <SheetHeader>
            <SheetTitle>{t('filters.title')}</SheetTitle>
          </SheetHeader>
          <SheetBody>
            <CatalogFilters filters={filters} view={view} />
          </SheetBody>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default MobileFilterButton;
