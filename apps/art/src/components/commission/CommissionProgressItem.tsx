'use client';

import { useTranslation } from '@hatohui/i18n';
import { Button, RichTextView } from '@hatohui/ui';
import type { CommissionProgressDto } from '@hatohui/models';
import type { AttachmentUploader } from '@/hooks/useAttachmentUpload';
import type { CommentInput } from '@/hooks/useCommentComposer';
import { CommentThread } from '@/components/shared/CommentThread';
import { Markdown } from '@/components/shared/Markdown';
import { OrderPostImages } from '@/components/orders/OrderPostImages';
import { CommissionProgressItemMeta } from './CommissionProgressItemMeta';

export function CommissionProgressItem({
  item,
  upload,
  onRemove,
  onComment,
}: {
  item: CommissionProgressDto;
  upload: AttachmentUploader;
  onRemove: () => void;
  onComment: (input: CommentInput) => Promise<unknown>;
}) {
  const { t } = useTranslation('art');

  return (
    <li className="space-y-2 rounded-md bg-card p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">
          {item.title || t('commission.admin.progress.untitled')}
          {item.isFinal && (
            <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
              {t('commission.admin.progress.final')}
            </span>
          )}
        </span>
        <div className="flex items-center gap-2">
          <CommissionProgressItemMeta item={item} />
          <Button size="sm" variant="ghost" onClick={onRemove}>
            {t('gallery.card.delete')}
          </Button>
        </div>
      </div>
      {item.description && <Markdown>{item.description}</Markdown>}
      {item.body && <RichTextView value={item.body} className="text-sm" />}
      <OrderPostImages images={item.images} />
      {item.visibility === 'CLIENT' && (
        <CommentThread
          comments={item.comments}
          viewerRole="ARTIST"
          showReceipts
          upload={upload}
          onAdd={onComment}
        />
      )}
    </li>
  );
}
