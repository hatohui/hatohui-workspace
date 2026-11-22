import { useTranslation } from '@hatohui/i18n';
import { cn } from '@hatohui/ui';
import { X } from 'lucide-react';
import { CHIP_BASE, CHIP_SELECTED } from '../../constants/chips';
import type { AdminColumnFilters } from '../../hooks/useAdminColumnFilters';

interface Props {
  filters: AdminColumnFilters;
  onToggle: (key: string, value: string) => void;
  onClear: () => void;
}

function ActiveColumnFilters({ filters, onToggle, onClear }: Props) {
  const { t } = useTranslation();
  if (filters.active.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {filters.active.map(({ key, value, label }) => (
        <button
          key={`${key}:${value}`}
          type="button"
          onClick={() => onToggle(key, value)}
          aria-label={t('admin.filter.remove', { label })}
          className={cn(CHIP_BASE, CHIP_SELECTED)}
        >
          <span className="truncate">{label}</span>
          <X className="size-3.5 shrink-0" aria-hidden />
        </button>
      ))}
      <button
        type="button"
        onClick={onClear}
        className="cursor-pointer px-1.5 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
      >
        {t('admin.filter.clear')}
      </button>
    </div>
  );
}

export default ActiveColumnFilters;
