'use client';

import { RichTextView } from '@hatohui/ui';
import type { OrderUpdatePostData } from '@/hooks/useOrderUpdates';
import type { CommentInput } from '@/hooks/useCommentComposer';
import { useCommissionFormatters } from '@/hooks/useCommissionFormatters';
import { CommentThread } from '@/components/shared/CommentThread';
import { SeenStatus } from '@/components/shared/SeenStatus';
import { OrderApprovalBar } from './OrderApprovalBar';
import { OrderPostImages } from './OrderPostImages';
import { Markdown } from '@/components/shared/Markdown';
import type { AttachmentUploader } from '@/hooks/useAttachmentUpload';

export function OrderUpdatePost({
  post,
  upload,
  onComment,
  onApprove,
}: {
  post: OrderUpdatePostData;
  upload: AttachmentUploader;
  onComment: (input: CommentInput) => Promise<unknown>;
  onApprove: () => void;
}) {
  const format = useCommissionFormatters();

  return (
    <li className="relative">
      <span
        className="absolute top-5 -left-[25px] size-2.5 rounded-full bg-primary"
        aria-hidden
      />
      <article className="space-y-3 rounded-xl border border-border bg-card p-4">
        <header>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            {format.dateTime(post.date)}
            <SeenStatus state={post.seenState} />
          </p>
          {post.title && <p className="font-medium">{post.title}</p>}
        </header>
        {post.description && <Markdown>{post.description}</Markdown>}
        {post.body && <RichTextView value={post.body} className="text-sm" />}
        <OrderPostImages images={post.images} />
        {post.approval && (
          <OrderApprovalBar approval={post.approval} onApprove={onApprove} />
        )}
        <CommentThread
          comments={post.comments}
          viewerRole="CLIENT"
          upload={upload}
          onAdd={onComment}
        />
      </article>
    </li>
  );
}
