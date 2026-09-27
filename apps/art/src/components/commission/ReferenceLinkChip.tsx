'use client';

import { LinkIcon, X } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';

export function ReferenceLinkChip({
  url,
  onRemove,
}: {
  url: string;
  onRemove: () => void;
}) {
  const { t } = useTranslation('art');

  return (
    <li className="flex max-w-full items-center gap-1.5 rounded-md bg-secondary py-1 pr-1 pl-2 text-sm">
      <LinkIcon className="size-3.5 shrink-0 text-muted-foreground" />
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="max-w-64 truncate hover:underline"
      >
        {url}
      </a>
      <button
        type="button"
        aria-label={t('commission.form.removeLink')}
        className="rounded p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
        onClick={onRemove}
      >
        <X className="size-3.5" />
      </button>
    </li>
  );
}
