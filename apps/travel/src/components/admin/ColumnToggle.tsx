import { useTranslation } from '@hatohui/i18n';
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  type EditableColumn,
} from '@hatohui/ui';
import { Check, SlidersHorizontal } from 'lucide-react';

interface Props<T> {
  columns: EditableColumn<T>[];
  hiddenSet: Set<string>;
  onToggle: (key: string) => void;
}

function ColumnToggle<T>({ columns, hiddenSet, onToggle }: Props<T>) {
  const { t } = useTranslation();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10 gap-1.5"
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          {t('admin.columns')}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48 p-1.5">
        <div className="space-y-0.5">
          {columns.map((column) => {
            const visible = !hiddenSet.has(column.key);
            return (
              <button
                key={column.key}
                type="button"
                role="menuitemcheckbox"
                aria-checked={visible}
                onClick={() => onToggle(column.key)}
                className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent"
              >
                <span className="flex size-4 items-center justify-center rounded border border-border">
                  {visible && <Check className="size-3" />}
                </span>
                <span className="truncate">{column.label}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default ColumnToggle;
