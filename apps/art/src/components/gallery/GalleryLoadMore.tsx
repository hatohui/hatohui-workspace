'use client';

import { useIntersectionObserver } from '@hatohui/libs';
import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';

export function GalleryLoadMore({
  hasMore,
  isFetchingMore,
  onLoadMore,
}: {
  hasMore: boolean;
  isFetchingMore: boolean;
  onLoadMore: () => void;
}) {
  const { t } = useTranslation('art');
  const sentinelRef = useIntersectionObserver(
    onLoadMore,
    hasMore && !isFetchingMore,
  );

  if (!hasMore && !isFetchingMore) return null;

  return (
    <div className="mt-6 flex flex-col items-center gap-2">
      <div ref={sentinelRef} className="h-1 w-full" />
      {isFetchingMore ? (
        <p className="text-sm text-muted-foreground">
          {t('gallery.loadingMore')}
        </p>
      ) : (
        <Button type="button" variant="ghost" size="sm" onClick={onLoadMore}>
          {t('gallery.loadMore')}
        </Button>
      )}
    </div>
  );
}
