import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';

interface UsersPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
}

function UsersPagination({
  page,
  pageSize,
  total,
  hasMore,
  onPageChange,
}: UsersPaginationProps) {
  const { t } = useTranslation('workspace');
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex items-center gap-3 text-sm">
      <Button
        type="button"
        variant="outline"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        {t('users.prevPage')}
      </Button>
      <span>{t('users.pageIndicator', { page, total: totalPages })}</span>
      <Button
        type="button"
        variant="outline"
        disabled={!hasMore}
        onClick={() => onPageChange(page + 1)}
      >
        {t('users.nextPage')}
      </Button>
    </div>
  );
}

export default UsersPagination;
