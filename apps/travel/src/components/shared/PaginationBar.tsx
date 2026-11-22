import { useTranslation } from '@hatohui/i18n';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hatohui/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DIRECTORY_PAGE_SIZES } from '../../constants/travel';

interface Props {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  pageSizes?: readonly number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

function PaginationBar({
  page,
  pageSize,
  totalItems,
  totalPages,
  pageSizes = DIRECTORY_PAGE_SIZES,
  onPageChange,
  onPageSizeChange,
}: Props) {
  const { t } = useTranslation();
  if (totalItems <= pageSizes[0]) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-sm text-muted-foreground">
      <span>{t('admin.showing', { from, to, total: totalItems })}</span>
      <div className="flex items-center gap-3">
        <Select
          value={String(pageSize)}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger className="h-8 w-20" aria-label={t('admin.perPage')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizes.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={t('admin.previous')}
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-12 text-center text-xs tabular-nums">
            {page} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={t('admin.next')}
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PaginationBar;
