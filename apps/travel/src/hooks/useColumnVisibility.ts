import { useMemo, useState } from 'react';
import type { EditableColumn } from '@hatohui/ui';

function readHidden(storageKey: string, fallback: readonly string[]): string[] {
  if (typeof window === 'undefined') return [...fallback];
  try {
    const raw = window.localStorage.getItem(`travel-table-cols:${storageKey}`);
    return raw ? (JSON.parse(raw) as string[]) : [...fallback];
  } catch {
    return [...fallback];
  }
}

export function useColumnVisibility<T>(
  storageKey: string,
  columns: EditableColumn<T>[],
  defaultHidden: readonly string[] = [],
) {
  const [hidden, setHidden] = useState<string[]>(() =>
    readHidden(storageKey, defaultHidden),
  );

  const hiddenSet = useMemo(() => new Set(hidden), [hidden]);

  const visibleColumns = useMemo(() => {
    const next = columns.filter((col) => !hiddenSet.has(col.key));
    return next.length > 0 ? next : columns.slice(0, 1);
  }, [columns, hiddenSet]);

  const toggle = (key: string) => {
    setHidden((current) => {
      const next = current.includes(key)
        ? current.filter((item) => item !== key)
        : current.length < columns.length - 1
          ? [...current, key]
          : current;
      try {
        window.localStorage.setItem(
          `travel-table-cols:${storageKey}`,
          JSON.stringify(next),
        );
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  return { visibleColumns, hiddenSet, toggle };
}
