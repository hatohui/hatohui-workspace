'use client';

import { useRef } from 'react';
import { Plus, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Popover, PopoverAnchor, PopoverContent } from './popover';
import { useTagInput, type TagSuggestion } from './use-tag-input';

type Props = {
  id?: string;
  value: string[];
  onChange: (value: string[]) => void;
  suggestions: TagSuggestion[];
  placeholder?: string;
  createLabel: (tag: string) => string;
  removeLabel: (tag: string) => string;
  className?: string;
};

function TagInput({
  id,
  value,
  onChange,
  suggestions,
  placeholder,
  createLabel,
  removeLabel,
  className,
}: Props) {
  const tags = useTagInput({ value, onChange, suggestions });
  const anchorRef = useRef<HTMLDivElement>(null);
  const listId = id ? `${id}-suggestions` : undefined;

  return (
    <Popover open={tags.open} onOpenChange={tags.setOpen}>
      <PopoverAnchor asChild>
        <div
          ref={anchorRef}
          className={cn(
            'flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2 py-1.5 text-sm shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
            className,
          )}
        >
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-secondary py-0.5 pr-1 pl-2 text-xs"
            >
              {tag}
              <button
                type="button"
                aria-label={removeLabel(tag)}
                onClick={() => tags.remove(tag)}
                className="cursor-pointer rounded-full p-0.5 hover:bg-background"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
          <input
            id={id}
            role="combobox"
            aria-expanded={tags.open}
            aria-controls={listId}
            aria-autocomplete="list"
            value={tags.draft}
            placeholder={value.length === 0 ? placeholder : undefined}
            onChange={(event) => tags.changeDraft(event.target.value)}
            onKeyDown={tags.onKeyDown}
            onFocus={() => tags.setOpen(true)}
            onBlur={() => tags.draft && tags.add(tags.draft)}
            className="min-w-24 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        id={listId}
        role="listbox"
        align="start"
        className="max-h-56 w-(--radix-popover-trigger-width) overflow-y-auto p-1"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onInteractOutside={(event) => {
          if (
            event.target instanceof Node &&
            anchorRef.current?.contains(event.target)
          ) {
            event.preventDefault();
          }
        }}
      >
        {tags.options.map((option, index) => (
          <button
            key={`${option.isNew ? 'new' : 'tag'}-${option.value}`}
            type="button"
            role="option"
            aria-selected={index === tags.highlighted}
            onMouseDown={(event) => event.preventDefault()}
            onMouseEnter={() => tags.setHighlighted(index)}
            onClick={() => tags.add(option.value)}
            className={cn(
              'flex w-full cursor-pointer items-center justify-between gap-3 rounded-sm px-2 py-1.5 text-left text-sm',
              index === tags.highlighted && 'bg-accent text-accent-foreground',
            )}
          >
            <span className="flex items-center gap-1.5">
              {option.isNew && <Plus className="size-3.5" />}
              {option.isNew ? createLabel(option.value) : option.value}
            </span>
            {option.hint && (
              <span className="text-xs text-muted-foreground">
                {option.hint}
              </span>
            )}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

export { TagInput };
export type { TagSuggestion };
