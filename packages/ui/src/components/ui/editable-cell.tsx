import * as React from 'react';
import { cn } from '../../lib/utils';
import { SearchableSelect } from './searchable-select';

export interface EditableCellOption {
  label: string;
  value: string;
}

export interface EditableCellProps {
  value: string;
  displayValue?: string;
  editable?: boolean;
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

  if (!editable) {
    return (
      <div className="truncate px-3 py-2 text-sm">{displayValue ?? value}</div>
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
          'w-full truncate px-3 py-2 text-left text-sm outline-none',
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
