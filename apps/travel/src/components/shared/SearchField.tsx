import { useTranslation } from '@hatohui/i18n';
import { cn, Input } from '@hatohui/ui';
import { Search, X } from 'lucide-react';
import { FIELD_OUTLINE } from '../../constants/chips';
import {
  useSearchSuggest,
  type SearchSuggestion,
} from '../../hooks/useSearchSuggest';
import SearchHighlight from './SearchHighlight';

interface Props {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  suggestions?: SearchSuggestion[];
  onSelectSuggestion?: (suggestion: SearchSuggestion) => void;
}

function SearchField({
  value,
  placeholder,
  onChange,
  suggestions,
  onSelectSuggestion,
}: Props) {
  const { t } = useTranslation();
  const suggest = useSearchSuggest({
    value,
    onChange,
    suggestions,
    onSelect: onSelectSuggestion,
  });

  return (
    <div className="relative min-w-0 flex-1">
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-foreground/60"
        aria-hidden
      />
      <Input
        role="combobox"
        aria-expanded={suggest.shown}
        aria-controls={suggest.listId}
        aria-autocomplete="list"
        aria-activedescendant={
          suggest.shown && suggest.active >= 0
            ? `${suggest.listId}-${suggest.active}`
            : undefined
        }
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(event) => {
          onChange(event.target.value);
          suggest.setOpen(true);
          suggest.setActive(-1);
        }}
        onFocus={() => suggest.setOpen(true)}
        onBlur={() => suggest.setOpen(false)}
        onKeyDown={suggest.onKeyDown}
        className={cn(
          'h-9 rounded-full pr-8 pl-8 text-sm sm:h-8',
          FIELD_OUTLINE,
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label={t('catalog.clearSearch')}
          className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      )}
      {suggest.shown && (
        <ul
          id={suggest.listId}
          role="listbox"
          aria-label={t('catalog.searchSuggestions')}
          className="absolute inset-x-0 top-full z-30 mt-1.5 overflow-hidden rounded-2xl border border-border bg-popover p-1 text-popover-foreground shadow-lg"
        >
          {suggest.matches.map((item, index) => (
            <li
              key={item.id}
              id={`${suggest.listId}-${index}`}
              role="option"
              aria-selected={index === suggest.active}
              onMouseDown={(event) => {
                event.preventDefault();
                suggest.pick(item);
              }}
              onMouseEnter={() => suggest.setActive(index)}
              className={cn(
                'flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors',
                index === suggest.active
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent/60',
              )}
            >
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt=""
                  className="size-8 shrink-0 rounded-md object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  <SearchHighlight text={item.label} query={value} />
                </p>
                {item.sublabel && (
                  <p className="truncate text-xs text-muted-foreground">
                    <SearchHighlight text={item.sublabel} query={value} />
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchField;
