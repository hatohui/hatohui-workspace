import { Button } from './button';

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  prevLabel: string;
  nextLabel: string;
  pageIndicator: (page: number, totalPages: number) => string;
}

export function Pagination({
  page,
  pageSize,
  total,
  hasMore,
  onPageChange,
  prevLabel,
  nextLabel,
  pageIndicator,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex items-center gap-3 text-sm">
      <Button
        type="button"
        variant="outline"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        {prevLabel}
      </Button>
      <span>{pageIndicator(page, totalPages)}</span>
      <Button
        type="button"
        variant="outline"
        disabled={!hasMore}
        onClick={() => onPageChange(page + 1)}
      >
        {nextLabel}
      </Button>
    </div>
  );
}
