'use client';

import { useRef } from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { cn, Popover, PopoverAnchor, PopoverContent } from '@hatohui/ui';
import type { useGalleryAssets } from '@/hooks/useGalleryAssets';
import { useGallerySearch } from '@/hooks/useGallerySearch';
import { GallerySearchTagChip } from './GallerySearchTagChip';

export function GallerySearch({
  gallery,
}: {
  gallery: ReturnType<typeof useGalleryAssets>;
}) {
  const { t } = useTranslation('art');
  const search = useGallerySearch(gallery);
  const anchorRef = useRef<HTMLDivElement>(null);

  return (
    <Popover open={search.isOpen} onOpenChange={search.setIsOpen}>
      <PopoverAnchor asChild>
        <div
          ref={anchorRef}
          className="flex min-h-9 w-full max-w-sm flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1 text-sm shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50"
        >
          <Search
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
          {gallery.tags.map((tag) => (
            <GallerySearchTagChip
              key={tag}
              tag={tag}
              onRemove={() => search.clearTag(tag)}
            />
          ))}
          <input
            role="combobox"
            aria-expanded={search.isOpen}
            aria-autocomplete="list"
            value={gallery.query}
            placeholder={
              gallery.tags.length > 0
                ? undefined
                : t('gallery.searchPlaceholder')
            }
            onChange={(event) => search.changeQuery(event.target.value)}
            onFocus={() => search.setIsOpen(true)}
            onKeyDown={search.onKeyDown}
            className="min-w-24 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        role="listbox"
        align="start"
        className="w-(--radix-popover-trigger-width) p-1"
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
        {search.suggestions.map((suggestion, index) => (
          <button
            key={suggestion.name}
            type="button"
            role="option"
            aria-selected={index === search.highlighted}
            onMouseDown={(event) => event.preventDefault()}
            onMouseEnter={() => search.setHighlighted(index)}
            onClick={() => search.pick(suggestion.name)}
            className={cn(
              'flex w-full cursor-pointer items-center justify-between gap-3 rounded-sm px-2 py-1.5 text-left text-sm',
              index === search.highlighted &&
                'bg-accent text-accent-foreground',
            )}
          >
            <span className={cn(suggestion.accent && 'text-primary')}>
              {suggestion.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {suggestion.hint}
            </span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
