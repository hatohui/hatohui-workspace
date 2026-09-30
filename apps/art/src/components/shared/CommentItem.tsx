'use client';

import { useTranslation } from '@hatohui/i18n';
import type { CommentDto } from '@hatohui/models';
import { cn } from '@hatohui/ui';
import { useCommissionFormatters } from '@/hooks/useCommissionFormatters';
import { commentSeenState } from '@/lib/seenState';
import { SeenStatus } from './SeenStatus';
import { CommentImages } from './CommentImages';
import { Markdown } from './Markdown';

export function CommentItem({
  comment,
  viewerRole,
  showReceipts,
}: {
  comment: CommentDto;
  viewerRole: CommentDto['authorRole'];
  showReceipts: boolean;
}) {
  const { t } = useTranslation('art');
  const format = useCommissionFormatters();
  const isOwn = comment.authorRole === viewerRole;

  return (
    <li
      className={cn(
        'rounded-lg px-3 py-2 text-sm',
        isOwn ? 'bg-primary/10' : 'bg-secondary',
      )}
    >
      <p className="mb-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">
          {isOwn
            ? t('comments.you')
            : t(`comments.author.${comment.authorRole}`)}
        </span>
        <span aria-hidden>·</span>
        {format.dateTime(comment.createdAt)}
        <SeenStatus
          state={commentSeenState(comment, viewerRole, showReceipts)}
        />
      </p>
      {comment.body && <Markdown>{comment.body}</Markdown>}
      <CommentImages images={comment.images} />
    </li>
  );
}
