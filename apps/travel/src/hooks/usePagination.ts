import { useMemo, useState } from 'react';

export function usePagination<T>(
  items: T[],
  resetKey: string,
  pageSize: number,
) {
  const effectiveKey = `${resetKey}:${pageSize}`;
  const [state, setState] = useState({ key: effectiveKey, page: 1 });

  const page = state.key === effectiveKey ? state.page : 1;
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);

  const pagedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, pageSize, safePage]);

  const setPage = (next: number) => {
    setState({ key: effectiveKey, page: next });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    page: safePage,
    setPage,
    pageSize,
    totalItems,
    totalPages,
    pagedItems,
  };
}
