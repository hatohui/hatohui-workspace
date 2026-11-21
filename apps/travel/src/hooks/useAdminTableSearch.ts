import { useMemo, useState } from 'react';
import type { EditableColumn } from '@hatohui/ui';
import type { SearchSuggestion } from './useSearchSuggest';

function cellText<T>(row: T, column: EditableColumn<T>): string {
  const rendered = column.render?.(row);
  if (rendered !== undefined) return rendered;
  const raw = row[column.key];
  if (
    typeof raw === 'string' ||
    typeof raw === 'number' ||
    typeof raw === 'boolean'
  ) {
    return String(raw);
  }
  return '';
}

export function useAdminTableSearch<T extends { id: string; name: string }>(
  rows: T[],
  columns: EditableColumn<T>[],
) {
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();

  const filteredRows = useMemo(() => {
    if (!query) return rows;
    return rows.filter((row) =>
      columns.some((column) =>
        cellText(row, column).toLowerCase().includes(query),
      ),
    );
  }, [columns, query, rows]);

  const suggestions = useMemo<SearchSuggestion[]>(
    () =>
      rows.map((row) => {
        const extra = columns
          .slice(1, 3)
          .map((column) => cellText(row, column))
          .filter(Boolean)
          .join(' · ');
        return {
          id: row.id,
          label: row.name,
          sublabel: extra || undefined,
        };
      }),
    [columns, rows],
  );

  return { search, setSearch, filteredRows, suggestions };
}
