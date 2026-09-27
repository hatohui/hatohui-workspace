import { useState, type KeyboardEvent } from 'react';

export type TagSuggestion = {
  value: string;
  hint?: string;
  group?: string;
  accent?: boolean;
};

export type TagOption = TagSuggestion & { isNew: boolean };

const sameTag = (a: string, b: string) =>
  a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0;

export function useTagInput({
  value,
  onChange,
  suggestions,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  suggestions: TagSuggestion[];
}) {
  const [draft, setDraft] = useState('');
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);

  const needle = draft.trim();
  const groupOrder = [...new Set(suggestions.map((s) => s.group))];
  const hasTag = (tag: string) => value.some((v) => sameTag(v, tag));
  const matches = suggestions
    .filter(
      (s) =>
        !hasTag(s.value) &&
        s.value.toLowerCase().includes(needle.toLowerCase()),
    )
    .sort(
      (a, b) =>
        groupOrder.indexOf(a.group) - groupOrder.indexOf(b.group) ||
        Number(sameTag(b.value, needle)) - Number(sameTag(a.value, needle)),
    );
  const isNew =
    needle !== '' &&
    !hasTag(needle) &&
    !suggestions.some((s) => sameTag(s.value, needle));
  const options: TagOption[] = [
    ...matches.map((s) => ({ ...s, isNew: false })),
    ...(isNew ? [{ value: needle, isNew: true }] : []),
  ];

  const add = (raw: string) => {
    const tags = raw
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .map(
        (tag) => suggestions.find((s) => sameTag(s.value, tag))?.value ?? tag,
      );
    const next = [...value];
    for (const tag of tags) {
      if (!next.some((v) => sameTag(v, tag))) next.push(tag);
    }
    if (next.length !== value.length) onChange(next);
    setDraft('');
    setHighlighted(0);
  };

  const isAccent = (tag: string) =>
    suggestions.some((s) => s.accent && sameTag(s.value, tag));

  const remove = (tag: string) => onChange(value.filter((t) => t !== tag));

  const changeDraft = (next: string) => {
    setOpen(true);
    setHighlighted(0);
    if (next.includes(',')) {
      const lastComma = next.lastIndexOf(',');
      add(next.slice(0, lastComma));
      setDraft(next.slice(lastComma + 1));
    } else {
      setDraft(next);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const option = options[highlighted];
      if (option) add(option.value);
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setHighlighted((i) =>
        options.length === 0 ? 0 : (i + step + options.length) % options.length,
      );
    } else if (event.key === 'Backspace' && draft === '' && value.length) {
      remove(value[value.length - 1]);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  return {
    draft,
    open: open && options.length > 0,
    setOpen,
    options,
    highlighted,
    setHighlighted,
    add,
    remove,
    isAccent,
    changeDraft,
    onKeyDown,
  };
}
