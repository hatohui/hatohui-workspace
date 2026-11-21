import * as React from 'react';
import { cn } from '../../lib/utils';
import { SearchableSelect } from './searchable-select';
import { Switch } from './switch';
import { TagInput } from './tag-input';
import type { TagSuggestion } from './use-tag-input';

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
  suggestions?: TagSuggestion[];
  maxTags?: number;
  createLabel?: (tag: string) => string;
  removeLabel?: (tag: string) => string;
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
  suggestions,
  maxTags,
  createLabel,
  removeLabel,
  selectPlaceholder = 'Select...',
  searchPlaceholder = 'Search...',
  emptyLabel = 'No matches.',
  onCommit,
  onNavigate,
}: EditableCellProps) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const tagWrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!editing) return;
    if (suggestions) {
      tagWrapperRef.current?.querySelector('input')?.focus();
      const handlePointerDown = (event: PointerEvent) => {
        const target = event.target;
        if (!(target instanceof Node)) return;
        if (tagWrapperRef.current?.contains(target)) return;
        if (target instanceof Element && target.closest('[role="listbox"]')) {
          return;
        }
        setEditing(false);
      };
      document.addEventListener('pointerdown', handlePointerDown);
      return () =>
        document.removeEventListener('pointerdown', handlePointerDown);
    }
    inputRef.current?.focus();
  }, [editing, suggestions]);

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
      <div className="h-full min-h-9 truncate bg-muted/40 px-3 py-2 text-sm text-muted-foreground/60">
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

  if (suggestions) {
    const tags = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    return (
      <div
        ref={tagWrapperRef}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setEditing(false);
        }}
      >
        <TagInput
          value={tags}
          onChange={(next) => {
            const limited = maxTags ? next.slice(0, maxTags) : next;
            onCommit(limited.join(', '));
          }}
          suggestions={suggestions}
          placeholder={selectPlaceholder}
          createLabel={createLabel ?? ((tag) => `Add "${tag}"`)}
          removeLabel={removeLabel ?? ((tag) => `Remove ${tag}`)}
          className="rounded-none border-0 shadow-none ring-2 ring-ring"
        />
      </div>
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
