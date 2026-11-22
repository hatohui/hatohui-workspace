import { useMemo, useState } from 'react';
import { matchesSearch } from '@hatohui/tools';
import type { EditableColumn } from '@hatohui/ui';
import type { SearchSuggestion } from './useSearchSuggest';

function cellText<T>(row: T, column: EditableColumn<T>): string {
  if (column.renderCell) return '';
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

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    return rows.filter((row) =>
      matchesSearch(
        search,
        columns.map((column) => cellText(row, column)),
      ),
    );
  }, [columns, rows, search]);

  const suggestions = useMemo<SearchSuggestion[]>(
    () =>
      rows.map((row) => {
        const extra = columns
          .filter((column) => !column.renderCell)
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
