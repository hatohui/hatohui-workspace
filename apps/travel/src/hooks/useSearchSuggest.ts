import { useId, useMemo, useState, type KeyboardEvent } from 'react';
import { SEARCH_SUGGESTION_LIMIT } from '../constants/travel';

export interface SearchSuggestion {
  id: string;
  label: string;
  sublabel?: string | null;
  imageUrl?: string | null;
}

interface Options {
  value: string;
  onChange: (value: string) => void;
  suggestions?: SearchSuggestion[];
  onSelect?: (suggestion: SearchSuggestion) => void;
  showOnEmpty?: boolean;
}

export function useSearchSuggest({
  value,
  onChange,
  suggestions = [],
  onSelect,
  showOnEmpty = false,
}: Options) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const query = value.trim().toLowerCase();

  const matches = useMemo(() => {
    if (!query && !showOnEmpty) return [];
    const seen = new Set<string>();
    const result: SearchSuggestion[] = [];
    for (const item of suggestions) {
      if (query) {
        const hay = `${item.label} ${item.sublabel ?? ''}`.toLowerCase();
        if (!hay.includes(query)) continue;
      }
      const key = item.label.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(item);
      if (result.length >= SEARCH_SUGGESTION_LIMIT) break;
    }
    return result;
  }, [query, showOnEmpty, suggestions]);

  const shown = open && (showOnEmpty || query.length > 0) && matches.length > 0;

  const pick = (suggestion: SearchSuggestion) => {
    setOpen(false);
    setActive(-1);
    if (onSelect) onSelect(suggestion);
    else onChange(suggestion.label);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (!shown) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActive(
        (current) => (current + step + matches.length) % matches.length,
      );
    } else if (event.key === 'Enter' && active >= 0) {
      event.preventDefault();
      const chosen = matches[active];
      if (chosen) pick(chosen);
    }
  };

  return {
    listId,
    open,
    setOpen,
    active,
    setActive,
    matches,
    shown,
    pick,
    onKeyDown,
  };
}
