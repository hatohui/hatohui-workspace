import * as React from 'react';
import { cn } from '../../lib/utils';

export interface EditableCellOption {
  label: string;
  value: string;
}

export interface EditableCellProps {
  value: string;
  displayValue?: string;
  editable?: boolean;
  options?: EditableCellOption[];
  onCommit: (value: string) => void;
  onNavigate?: (direction: 'down' | 'right') => void;
}

export function EditableCell({
  value,
  displayValue,
  editable = true,
  options,
  onCommit,
  onNavigate,
}: EditableCellProps) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const ref = React.useRef<HTMLInputElement | HTMLSelectElement>(null);

  React.useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);

  if (!editable) {
    return <div className="px-3 py-2 text-sm">{displayValue ?? value}</div>;
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
          'w-full px-3 py-2 text-left text-sm outline-none',
          'hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring',
        )}
      >
        {displayValue ?? (value || ' ')}
      </button>
    );
  }

  const commonProps = {
    autoFocus: true,
    className:
      'w-full border-0 bg-transparent px-3 py-2 text-sm outline-none ring-2 ring-ring',
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
      commit(e.target.value),
    onKeyDown: (e: React.KeyboardEvent) => {
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
    },
  };

  if (options) {
    return (
      <select
        ref={ref as React.RefObject<HTMLSelectElement>}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        {...commonProps}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      ref={ref as React.RefObject<HTMLInputElement>}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      {...commonProps}
    />
  );
}
