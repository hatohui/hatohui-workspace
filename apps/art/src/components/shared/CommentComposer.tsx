'use client';

import { SendHorizontal } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Button, Spinner, Textarea } from '@hatohui/ui';
import {
  useCommentComposer,
  type CommentInput,
} from '@/hooks/useCommentComposer';
import type { AttachmentUploader } from '@/hooks/useAttachmentUpload';
import { CommentAttachmentPreviews } from './CommentAttachmentPreviews';
import { AttachImagesButton } from './AttachImagesButton';

export function CommentComposer({
  onAdd,
  upload,
}: {
  onAdd: (input: CommentInput) => Promise<unknown>;
  upload: AttachmentUploader;
}) {
  const { t } = useTranslation('art');
  const composer = useCommentComposer(onAdd, upload);

  return (
    <form
      className="space-y-2"
      onSubmit={(event) => {
        event.preventDefault();
        void composer.send();
      }}
    >
      <CommentAttachmentPreviews previews={composer.previews} />
      <div className="flex items-end gap-1">
        <Textarea
          rows={1}
          value={composer.body}
          placeholder={t('comments.placeholder')}
          aria-label={t('comments.placeholder')}
          className="field-sizing-content max-h-60 min-h-9 resize-none py-2"
          onChange={(event) => composer.setBody(event.target.value)}
          onPaste={composer.inline.onPaste}
          onDrop={composer.inline.onDrop}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              void composer.send();
            }
          }}
        />
        <AttachImagesButton
          disabled={!composer.canAttach}
          onPick={composer.attach}
        />
        <Button
          type="submit"
          size="icon"
          variant="ghost"
          className="shrink-0 text-primary"
          disabled={!composer.canSend}
          aria-label={t('comments.send')}
        >
          {composer.isBusy ? <Spinner /> : <SendHorizontal />}
        </Button>
      </div>
      {composer.hasFailed && (
        <p role="alert" className="text-xs text-destructive">
          {t('comments.sendFailed')}
        </p>
      )}
    </form>
  );
}
