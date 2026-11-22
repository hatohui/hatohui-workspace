import { useId, useMemo, useState, type KeyboardEvent } from 'react';
import { matchesSearch, searchMatchRank } from '@hatohui/tools';
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
  const hasQuery = value.trim().length > 0;

  const matches = useMemo(() => {
    if (!hasQuery && !showOnEmpty) return [];
    const filtered = suggestions.filter(
      (item) => !hasQuery || matchesSearch(value, [item.label, item.sublabel]),
    );
    const ordered = hasQuery
      ? [...filtered].sort(
          (a, b) =>
            searchMatchRank(value, a.label) - searchMatchRank(value, b.label),
        )
      : filtered;
    const seen = new Set<string>();
    const result: SearchSuggestion[] = [];
    for (const item of ordered) {
      const key = item.label.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(item);
      if (result.length >= SEARCH_SUGGESTION_LIMIT) break;
    }
    return result;
  }, [hasQuery, showOnEmpty, suggestions, value]);

  const shown = open && (showOnEmpty || hasQuery) && matches.length > 0;

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
