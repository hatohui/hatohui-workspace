'use client';

import type { CommentDto } from '@hatohui/models';
import type { CommentInput } from '@/hooks/useCommentComposer';
import type { AttachmentUploader } from '@/hooks/useAttachmentUpload';
import { CommentComposer } from './CommentComposer';
import { CommentItem } from './CommentItem';

export function CommentThread({
  comments,
  viewerRole,
  showReceipts = false,
  upload,
  onAdd,
}: {
  comments: CommentDto[];
  viewerRole: CommentDto['authorRole'];
  showReceipts?: boolean;
  upload: AttachmentUploader;
  onAdd: (input: CommentInput) => Promise<unknown>;
}) {
  return (
    <div className="space-y-3 border-t border-border pt-3">
      {comments.length > 0 && (
        <ul className="space-y-2">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              viewerRole={viewerRole}
              showReceipts={showReceipts}
            />
          ))}
        </ul>
      )}
      <CommentComposer onAdd={onAdd} upload={upload} />
    </div>
  );
}
