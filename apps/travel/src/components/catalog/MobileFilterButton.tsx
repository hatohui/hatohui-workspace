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
import type { CatalogFilters as Filters } from '../../hooks/useCatalog';
import CatalogFilters from './CatalogFilters';

function MobileFilterButton({ filters }: { filters: Filters }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        className="h-11 shrink-0 rounded-full lg:hidden"
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
