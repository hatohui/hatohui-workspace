import { useMemo, useState } from 'react';
import type { EditableColumn } from '@hatohui/ui';
import { DEFAULT_ADMIN_PAGE_SIZE } from '../constants/admin';
import { useAdminTableSearch } from './useAdminTableSearch';

type SortDirection = 'asc' | 'desc';

interface SortableRow {
  id: string;
  name: string;
  isDraft?: boolean;
}

function compareValues<T>(
  a: T,
  b: T,
  column: EditableColumn<T>,
  direction: SortDirection,
): number {
  const rawA = a[column.key];
  const rawB = b[column.key];
  const dir = direction === 'asc' ? 1 : -1;

  if (typeof rawA === 'number' && typeof rawB === 'number') {
    return (rawA - rawB) * dir;
  }

  if (column.key === 'createdAt') {
    const timeA = typeof rawA === 'string' ? Date.parse(rawA) : 0;
    const timeB = typeof rawB === 'string' ? Date.parse(rawB) : 0;
    return (
      ((Number.isNaN(timeA) ? 0 : timeA) - (Number.isNaN(timeB) ? 0 : timeB)) *
      dir
    );
  }

  const textA = column.render?.(a) ?? (typeof rawA === 'string' ? rawA : '');
  const textB = column.render?.(b) ?? (typeof rawB === 'string' ? rawB : '');
  return textA.localeCompare(textB, undefined, { sensitivity: 'base' }) * dir;
}

export function useAdminTableControls<T extends SortableRow>(
  rows: T[],
  columns: EditableColumn<T>[],
  defaultSort?: { key: keyof T & string; direction: SortDirection },
) {
  const tableSearch = useAdminTableSearch(rows, columns);
  const [sortBy, setSortBy] = useState<(keyof T & string) | undefined>(
    defaultSort?.key,
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    defaultSort?.direction ?? 'asc',
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_ADMIN_PAGE_SIZE);

  const onSortChange = (key: keyof T & string) => {
    setPage(1);
    if (sortBy === key) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDirection(key === 'createdAt' ? 'desc' : 'asc');
    }
  };

  const setSearch = (value: string) => {
    setPage(1);
    tableSearch.setSearch(value);
  };

  const changePageSize = (size: number) => {
    setPage(1);
    setPageSize(size);
  };

  const sortedRows = useMemo(() => {
    const column = sortBy ? columns.find((c) => c.key === sortBy) : undefined;
    if (!column) return tableSearch.filteredRows;
    return [...tableSearch.filteredRows].sort((a, b) => {
      if (Boolean(a.isDraft) !== Boolean(b.isDraft)) {
        return a.isDraft ? 1 : -1;
      }
      return compareValues(a, b, column, sortDirection);
    });
  }, [columns, sortBy, sortDirection, tableSearch.filteredRows]);

  const totalRows = sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const safePage = Math.min(page, totalPages);

  const pagedRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [pageSize, safePage, sortedRows]);

  return {
    search: tableSearch.search,
    setSearch,
    suggestions: tableSearch.suggestions,
    sortBy,
    sortDirection,
    onSortChange,
    page: safePage,
    setPage,
    pageSize,
    setPageSize: changePageSize,
    totalRows,
    totalPages,
    pagedRows,
  };
}
