'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronsUpDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { Input } from './input';
import { Popover, PopoverAnchor, PopoverContent } from './popover';

export type SearchableSelectOption = {
  value: string;
  label: string;
};

type Props = {
  id?: string;
  value: string | null;
  options: SearchableSelectOption[];
  placeholder: string;
  searchPlaceholder: string;
  emptyLabel: string;
  onChange: (value: string) => void;
  className?: string;
};

function SearchableSelect({
  id,
  value,
  options,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  onChange,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const needle = search.trim().toLowerCase();
  const filtered = needle
    ? options.filter((option) => option.label.toLowerCase().includes(needle))
    : options;

  const selected = options.find((option) => option.value === value);

  const select = (next: string) => {
    onChange(next);
    setOpen(false);
    setSearch('');
  };

  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector(`[data-value="${CSS.escape(value ?? '')}"]`)
      ?.scrollIntoView({ block: 'nearest' });
    const focus = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(focus);
  }, [open, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between gap-2 font-normal', className)}
          onClick={() => setOpen((previous) => !previous)}
        >
          <span
            className={cn('truncate', !selected && 'text-muted-foreground')}
          >
            {selected?.label ?? placeholder}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverAnchor>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div className="flex flex-col">
          <div className="border-b p-2">
            <Input
              ref={inputRef}
              placeholder={searchPlaceholder}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  if (filtered.length > 0) select(filtered[0].value);
                } else if (event.key === 'Escape') {
                  setOpen(false);
                }
              }}
              className="h-8 border-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <div
            ref={listRef}
            className="max-h-48 overflow-y-auto"
            onWheel={(event) => {
              event.currentTarget.scrollTop += event.deltaY;
            }}
          >
            {filtered.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {emptyLabel}
              </p>
            ) : (
              filtered.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  data-value={option.value}
                  onClick={() => select(option.value)}
                  className={cn(
                    'flex w-full cursor-pointer items-center px-3 py-1.5 text-left text-sm transition-colors duration-150 ease-out hover:bg-accent hover:text-accent-foreground motion-reduce:transition-none',
                    option.value === value &&
                      'bg-accent font-medium text-accent-foreground',
                  )}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { SearchableSelect };
