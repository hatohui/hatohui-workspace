import { cn } from '@hatohui/ui';
import { CHIP_BASE, CHIP_IDLE, CHIP_SELECTED } from '../../constants/chips';
import type { FilterableColumn } from '../../hooks/useAdminColumnFilters';

interface Props {
  column: FilterableColumn;
  selected: readonly string[];
  onToggle: (value: string) => void;
}

function ColumnFilterSection({ column, selected, onToggle }: Props) {
  return (
    <section className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">
        {column.label}
      </p>
      <div
        role="group"
        aria-label={column.label}
        className="flex flex-wrap gap-1"
      >
        {column.values.map(({ value, label, count }) => {
          const isOn = selected.includes(value);
          return (
            <button
              key={value}
              type="button"
              aria-pressed={isOn}
              onClick={() => onToggle(value)}
              className={cn(CHIP_BASE, isOn ? CHIP_SELECTED : CHIP_IDLE)}
            >
              <span className="truncate">{label}</span>
              <span className="tabular-nums opacity-60">{count}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default ColumnFilterSection;
