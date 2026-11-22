import type { ReactNode } from 'react';
import { useTranslation } from '@hatohui/i18n';
import {
  cn,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hatohui/ui';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { getPageNumbers } from '../../lib/pageNumbers';

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PILL_NAV_CLASS =
  'inline-flex h-8 cursor-pointer items-center gap-1 rounded-full border border-border bg-card px-2.5 text-xs font-medium text-foreground shadow-xs transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-45 sm:h-9 sm:px-3 sm:text-sm';

const PILL_PAGE_CLASS =
  'inline-flex size-8 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-xs font-medium text-foreground shadow-xs transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary sm:size-9 sm:text-sm';

function PaginationBar({ page, totalPages, onPageChange }: Props) {
  const { t } = useTranslation();
  if (totalPages <= 1) return null;

  const pageSelect = (
    trigger: ReactNode,
    triggerClass: string,
    ariaLabel: string,
  ) => (
    <Select
      value={String(page)}
      onValueChange={(value) => onPageChange(Number(value))}
    >
      <SelectTrigger aria-label={ariaLabel} className={triggerClass}>
        {trigger}
      </SelectTrigger>
      <SelectContent>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <SelectItem key={n} value={String(n)}>
            {n}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <nav
      aria-label={t('admin.showing', {
        from: page,
        to: page,
        total: totalPages,
      })}
      className="flex items-center justify-center pt-2"
    >
      <ul className="flex flex-wrap items-center justify-center gap-1">
        <li>
          <button
            type="button"
            disabled={page <= 1}
            aria-label={t('admin.previous')}
            onClick={() => onPageChange(page - 1)}
            className={PILL_NAV_CLASS}
          >
            <ChevronLeft className="size-4" aria-hidden />
            <span className="hidden sm:inline">{t('admin.previous')}</span>
          </button>
        </li>
        {getPageNumbers(page, totalPages).map((item, index) => (
          <li key={item === 'ellipsis' ? `ellipsis-${index}` : item}>
            {item === 'ellipsis' ? (
              pageSelect(
                <MoreHorizontal className="size-4" aria-hidden />,
                'size-8 justify-center gap-0 rounded-full border-none bg-transparent p-0 text-muted-foreground shadow-none hover:bg-primary/10 hover:text-primary data-[size=default]:h-8 dark:bg-transparent dark:hover:bg-primary/10 sm:size-9 sm:data-[size=default]:h-9 [&>svg]:hidden',
                t('admin.jumpToPage'),
              )
            ) : item === page ? (
              pageSelect(
                <SelectValue />,
                cn(
                  'size-8 justify-center gap-0 rounded-full border-primary bg-primary p-0 text-xs font-semibold text-primary-foreground shadow-sm data-[size=default]:h-8 sm:size-9 sm:text-sm sm:data-[size=default]:h-9 [&>svg]:hidden',
                  'cursor-pointer transition-colors hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90',
                ),
                t('admin.jumpToPage'),
              )
            ) : (
              <button
                type="button"
                onClick={() => onPageChange(item)}
                className={PILL_PAGE_CLASS}
              >
                {item}
              </button>
            )}
          </li>
        ))}
        <li>
          <button
            type="button"
            disabled={page >= totalPages}
            aria-label={t('admin.next')}
            onClick={() => onPageChange(page + 1)}
            className={PILL_NAV_CLASS}
          >
            <span className="hidden sm:inline">{t('admin.next')}</span>
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default PaginationBar;
