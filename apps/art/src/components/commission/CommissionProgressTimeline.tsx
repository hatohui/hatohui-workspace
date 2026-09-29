'use client';

import { useTranslation } from '@hatohui/i18n';
import { useCommissionProgressAdmin } from '@/hooks/useCommissionProgress';
import { useArtistAttachmentUpload } from '@/hooks/useAttachmentUpload';
import { useProgressPostForm } from '@/hooks/useProgressPostForm';
import { CommissionProgressItem } from './CommissionProgressItem';
import { CommissionProgressPostForm } from './CommissionProgressPostForm';
import { ImagePreviewProvider } from '@/components/shared/ImagePreviewProvider';

export function CommissionProgressTimeline({
  commissionId,
}: {
  commissionId: string;
}) {
  const { t } = useTranslation('art');
  const { items, isLoading, create, remove, comment } =
    useCommissionProgressAdmin(commissionId);
  const upload = useArtistAttachmentUpload(commissionId);
  const form = useProgressPostForm(upload, create);

  return (
    <ImagePreviewProvider>
      <div className="space-y-4 rounded-lg border border-border p-4">
        <h2 className="text-sm font-medium">
          {t('commission.admin.progress.title')}
        </h2>

        {isLoading ? (
          <p className="text-muted-foreground">{t('common:loading')}</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('commission.admin.progress.empty')}
          </p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <CommissionProgressItem
                key={item.id}
                item={item}
                upload={upload}
                onRemove={() => void remove(item.id)}
                onComment={(input) => comment(item.id, input)}
              />
            ))}
          </ul>
        )}

        <CommissionProgressPostForm form={form} />
      </div>
    </ImagePreviewProvider>
  );
}
