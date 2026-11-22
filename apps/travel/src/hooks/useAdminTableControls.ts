import { useMemo, useState } from 'react';
import type { EditableColumn } from '@hatohui/ui';
import {
  ADMIN_AUTO_PAGE_SIZE,
  DEFAULT_ADMIN_PAGE_SIZE,
  type AdminPageSize,
} from '../constants/admin';
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
  autoPageSize: number,
  defaultSort?: { key: keyof T & string; direction: SortDirection },
) {
  const tableSearch = useAdminTableSearch(rows, columns);
  const resolvedDefaultSort =
    defaultSort ??
    (columns.some((c) => c.key === 'createdAt')
      ? { key: 'createdAt' as keyof T & string, direction: 'desc' as const }
      : undefined);
  const [sortBy, setSortBy] = useState<(keyof T & string) | undefined>(
    resolvedDefaultSort?.key,
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    resolvedDefaultSort?.direction ?? 'asc',
  );
  const [page, setPage] = useState(1);
  const [pageSizeChoice, setPageSizeChoice] = useState<AdminPageSize>(
    DEFAULT_ADMIN_PAGE_SIZE,
  );
  const pageSize =
    pageSizeChoice === ADMIN_AUTO_PAGE_SIZE ? autoPageSize : pageSizeChoice;

  const onSortChange = (key: keyof T & string) => {
    setPage(1);
    if (sortBy === key) {
      if (
        resolvedDefaultSort &&
        key !== resolvedDefaultSort.key &&
        sortDirection === 'desc'
      ) {
        setSortBy(resolvedDefaultSort.key);
        setSortDirection(resolvedDefaultSort.direction);
      } else {
        setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      }
    } else {
      setSortBy(key);
      setSortDirection(key === 'createdAt' ? 'desc' : 'asc');
    }
  };

  const setSearch = (value: string) => {
    setPage(1);
    tableSearch.setSearch(value);
  };

  const changePageSize = (size: AdminPageSize) => {
    setPage(1);
    setPageSizeChoice(size);
  };

  const sortedRows = useMemo(() => {
    const column = sortBy ? columns.find((c) => c.key === sortBy) : undefined;
    if (!column) return tableSearch.filteredRows;
    const dir = sortDirection === 'asc' ? 1 : -1;
    return [...tableSearch.filteredRows].sort((a, b) => {
      if (Boolean(a.isDraft) !== Boolean(b.isDraft)) {
        return a.isDraft ? 1 : -1;
      }
      return (
        compareValues(a, b, column, sortDirection) ||
        a.id.localeCompare(b.id) * dir
      );
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
    pageSizeChoice,
    setPageSize: changePageSize,
    totalRows,
    totalPages,
    pagedRows,
  };
}
