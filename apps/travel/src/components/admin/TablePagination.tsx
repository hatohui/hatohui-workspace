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
import {
  ADMIN_AUTO_PAGE_SIZE,
  ADMIN_PAGE_SIZES,
  type AdminPageSize,
} from '../../constants/admin';

interface Props {
  page: number;
  pageSize: number;
  pageSizeChoice: AdminPageSize;
  totalRows: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: AdminPageSize) => void;
}

function TablePagination({
  page,
  pageSize,
  pageSizeChoice,
  totalRows,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: Props) {
  const { t } = useTranslation();
  if (totalRows === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalRows);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
      <span>{t('admin.showing', { from, to, total: totalRows })}</span>
      <div className="flex items-center gap-3">
        <Select
          value={String(pageSizeChoice)}
          onValueChange={(value) =>
            onPageSizeChange(
              value === ADMIN_AUTO_PAGE_SIZE ? value : Number(value),
            )
          }
        >
          <SelectTrigger className="h-8 w-28" aria-label={t('admin.perPage')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ADMIN_PAGE_SIZES.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size === ADMIN_AUTO_PAGE_SIZE
                  ? t('admin.autoPageSize', { count: pageSize })
                  : size}
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

export default TablePagination;
