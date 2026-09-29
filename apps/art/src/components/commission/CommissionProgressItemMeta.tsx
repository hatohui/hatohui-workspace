'use client';

import { useTranslation } from '@hatohui/i18n';
import type { CommissionProgressDto } from '@hatohui/models';
import { SeenStatus } from '@/components/shared/SeenStatus';
import { updateSeenState } from '@/lib/seenState';

export function CommissionProgressItemMeta({
  item,
}: {
  item: CommissionProgressDto;
}) {
  const { t } = useTranslation('art');

  return (
    <>
      {item.requestsApproval && (
        <span className="text-xs text-muted-foreground">
          {item.approvedAt
            ? t('commission.admin.progress.approvedByClient')
            : t('commission.admin.progress.awaitingApproval')}
        </span>
      )}
      {item.visibility === 'CLIENT' && (
        <SeenStatus state={updateSeenState(item.seenByClientAt, true)} />
      )}
      <span className="text-xs text-muted-foreground">
        {t(
          item.visibility === 'CLIENT'
            ? 'commission.admin.detail.noteVisibilityClient'
            : 'commission.admin.detail.noteVisibilityInternal',
        )}
      </span>
    </>
  );
}
