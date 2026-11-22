export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export function paginateList<T>(
  all: T[],
  requestedPage?: number,
  requestedPageSize?: number,
  defaultPageSize = 16,
): PaginatedResult<T> {
  const pageSize = requestedPageSize ?? defaultPageSize;
  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage ?? 1, totalPages);
  const start = (page - 1) * pageSize;
  return {
    items: all.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    hasMore: page < totalPages,
  };
}
