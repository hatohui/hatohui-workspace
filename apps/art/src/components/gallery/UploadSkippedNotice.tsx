'use client';

import { useTranslation } from '@hatohui/i18n';

export function UploadSkippedNotice({ messages }: { messages: string[] }) {
  const { t } = useTranslation('art');

  if (messages.length === 0) return null;

  return (
    <div
      role="alert"
      className="rounded-md bg-secondary px-3 py-2 text-sm text-muted-foreground"
    >
      <p className="font-medium text-foreground">
        {t('gallery.upload.skipped.title', { count: messages.length })}
      </p>
      <ul className="mt-1 list-disc space-y-0.5 pl-5">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  );
}
