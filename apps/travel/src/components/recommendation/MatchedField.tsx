import { useTranslation } from '@hatohui/i18n';
import { Input, Label, cn } from '@hatohui/ui';
import type { LucideIcon } from 'lucide-react';
import {
  useSearchSuggest,
  type SearchSuggestion,
} from '../../hooks/useSearchSuggest';
import SearchHighlight from '../shared/SearchHighlight';

interface Props {
  id: string;
  label: string;
  hint: string;
  placeholder: string;
  value: string;
  options: SearchSuggestion[];
  fallbackIcon: LucideIcon;
  isMatched: boolean;
  disabled: boolean;
  onChange: (value: string) => void;
}

function MatchedField(props: Props) {
  const { t } = useTranslation();
  const FallbackIcon = props.fallbackIcon;
  const hasValue = props.value.trim() !== '';
  const suggest = useSearchSuggest({
    value: props.value,
    onChange: props.onChange,
    suggestions: props.options,
  });

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={props.id}>{props.label}</Label>
        {hasValue && !props.disabled && (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs',
              props.isMatched
                ? 'bg-secondary text-muted-foreground'
                : 'bg-primary/15 text-primary',
            )}
          >
            {t(props.isMatched ? 'form.existing' : 'form.new')}
          </span>
        )}
      </div>
      <div className="relative">
        <Input
          id={props.id}
          role="combobox"
          aria-expanded={suggest.shown}
          aria-controls={suggest.listId}
          aria-autocomplete="list"
          required
          value={props.value}
          disabled={props.disabled}
          placeholder={props.placeholder}
          autoComplete="off"
          onChange={(event) => {
            props.onChange(event.target.value);
            suggest.setOpen(true);
            suggest.setActive(-1);
          }}
          onBlur={() => suggest.setOpen(false)}
          onKeyDown={suggest.onKeyDown}
        />
        {!props.disabled && suggest.shown && (
          <div className="absolute inset-x-0 top-full z-40 mt-1.5 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg">
            <ul
              id={suggest.listId}
              role="listbox"
              className="max-h-64 overflow-y-auto p-1 [scrollbar-width:thin]"
            >
              {suggest.matches.map((item, index) => (
                <li
                  key={item.id}
                  role="option"
                  aria-selected={index === suggest.active}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    suggest.pick(item);
                  }}
                  onMouseEnter={() => suggest.setActive(index)}
                  className={cn(
                    'flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors',
                    index === suggest.active
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/60',
                  )}
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="size-9 shrink-0 rounded-md object-cover"
                    />
                  ) : (
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <FallbackIcon className="size-4" aria-hidden />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      <SearchHighlight text={item.label} query={props.value} />
                    </p>
                    {item.sublabel && (
                      <p className="truncate text-xs text-muted-foreground">
                        <SearchHighlight
                          text={item.sublabel}
                          query={props.value}
                        />
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {!props.disabled && (
        <p className="text-xs text-muted-foreground">{props.hint}</p>
      )}
    </div>
  );
}

export default MatchedField;
