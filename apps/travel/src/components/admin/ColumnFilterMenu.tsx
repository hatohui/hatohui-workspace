import { useTranslation } from '@hatohui/i18n';
import { Button, Popover, PopoverContent, PopoverTrigger } from '@hatohui/ui';
import { ListFilter } from 'lucide-react';
import type { AdminColumnFilters } from '../../hooks/useAdminColumnFilters';
import ColumnFilterSection from './ColumnFilterSection';

interface Props {
  filters: AdminColumnFilters;
  onToggle: (key: string, value: string) => void;
}

function ColumnFilterMenu({ filters, onToggle }: Props) {
  const { t } = useTranslation();
  if (filters.columns.length === 0) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <ListFilter className="size-4" aria-hidden />
          {t('admin.filter.button')}
          {filters.active.length > 0 && (
            <span className="rounded-full bg-primary px-1.5 text-[11px] leading-4 font-semibold text-primary-foreground tabular-nums">
              {filters.active.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="max-h-[60dvh] w-80 space-y-4 overflow-y-auto"
      >
        {filters.columns.map((column) => (
          <ColumnFilterSection
            key={column.key}
            column={column}
            selected={filters.selected[column.key] ?? []}
            onToggle={(value) => onToggle(column.key, value)}
          />
        ))}
      </PopoverContent>
    </Popover>
  );
}

export default ColumnFilterMenu;
