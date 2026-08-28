import * as React from 'react';
import { cn } from '../../lib/utils';
import { SearchableSelect } from './searchable-select';
import { Switch } from './switch';

export interface EditableCellOption {
  label: string;
  value: string;
}

export interface EditableCellProps {
  value: string;
  displayValue?: string;
  editable?: boolean;
  /** Renders as an inline on/off Switch (value is 'true'/'false') that
   * commits immediately on toggle, instead of a click-to-edit control. */
  toggle?: boolean;
  options?: EditableCellOption[];
  selectPlaceholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  onCommit: (value: string) => void;
  onNavigate?: (direction: 'down' | 'right') => void;
}

export function EditableCell({
  value,
  displayValue,
  editable = true,
  toggle,
  options,
  selectPlaceholder = 'Select...',
  searchPlaceholder = 'Search...',
  emptyLabel = 'No matches.',
  onCommit,
  onNavigate,
}: EditableCellProps) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  if (toggle) {
    return (
      <div className="flex items-center justify-center px-2 py-2">
        <Switch
          checked={value === 'true'}
          disabled={!editable}
          onCheckedChange={(checked) => onCommit(checked ? 'true' : 'false')}
        />
      </div>
    );
  }

  if (!editable) {
    return (
      <div className="truncate px-3 py-2 text-sm text-muted-foreground/60">
        {displayValue ?? value}
      </div>
    );
  }

  if (options) {
    return (
      <SearchableSelect
        value={value}
        options={options}
        placeholder={selectPlaceholder}
        searchPlaceholder={searchPlaceholder}
        emptyLabel={emptyLabel}
        onChange={onCommit}
        className="h-auto w-full rounded-none border-0 px-3 py-2 text-sm"
      />
    );
  }

  const commit = (next: string) => {
    setEditing(false);
    if (next !== value) onCommit(next);
  };

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        className={cn(
          'w-full cursor-pointer truncate px-3 py-2 text-left text-sm outline-none transition-colors duration-150 ease-out motion-reduce:transition-none',
          'hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring',
        )}
      >
        {displayValue ?? (value || ' ')}
      </button>
    );
  }

  return (
    <input
      ref={inputRef}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      autoFocus
      className="w-full border-0 bg-transparent px-3 py-2 text-sm outline-none ring-2 ring-ring"
      onBlur={(e) => commit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          setEditing(false);
          return;
        }
        if (e.key === 'Enter') {
          commit((e.target as HTMLInputElement).value);
          onNavigate?.('down');
        }
        if (e.key === 'Tab' && !e.shiftKey) {
          e.preventDefault();
          commit((e.target as HTMLInputElement).value);
          onNavigate?.('right');
        }
      }}
    />
  );
}
