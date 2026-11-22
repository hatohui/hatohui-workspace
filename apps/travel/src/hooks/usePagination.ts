import { useMemo, useState } from 'react';
import { DEFAULT_DIRECTORY_PAGE_SIZE } from '../constants/travel';

export function usePagination<T>(
  items: T[],
  resetKey: string,
  defaultPageSize: number = DEFAULT_DIRECTORY_PAGE_SIZE,
) {
  const [state, setState] = useState({ key: resetKey, page: 1 });
  const [pageSize, setPageSizeState] = useState(defaultPageSize);

  const page = state.key === resetKey ? state.page : 1;
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);

  const pagedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, pageSize, safePage]);

  const setPage = (next: number) => {
    setState({ key: resetKey, page: next });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setPageSize = (size: number) => {
    setPageSizeState(size);
    setState({ key: resetKey, page: 1 });
  };

  return {
    page: safePage,
    setPage,
    pageSize,
    setPageSize,
    totalItems,
    totalPages,
    pagedItems,
  };
}
