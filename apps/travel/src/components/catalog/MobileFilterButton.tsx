import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import {
  Button,
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
  cn,
} from '@hatohui/ui';
import { SlidersHorizontal } from 'lucide-react';
import { FIELD_OUTLINE } from '../../constants/chips';
import type { CatalogFilters as Filters } from '../../hooks/useTravelFilterState';
import CatalogFilters from './CatalogFilters';

function MobileFilterButton({ filters }: { filters: Filters }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={cn(
          'h-9 shrink-0 rounded-full text-xs sm:h-8 lg:hidden',
          FIELD_OUTLINE,
        )}
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
            <CatalogFilters filters={filters} />
          </SheetBody>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default MobileFilterButton;
