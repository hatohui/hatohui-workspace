'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { Tooltip, TooltipContent, TooltipTrigger } from '@hatohui/ui';
import { LinkIcon } from 'lucide-react';

/** Renders the first reference as an image; if it fails to load (a client
 * pasted a link rather than uploading — the API stores both the same way),
 * falls back to a linked icon with the URL in a tooltip. */
export function ReferenceThumbnail({ url }: { url: string | undefined }) {
  const { t } = useTranslation('art');
  const [failed, setFailed] = useState(false);

  if (!url) {
    return (
      <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-card text-xs text-muted-foreground">
        {t('commission.admin.triage.noReference')}
      </div>
    );
  }

  if (failed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex size-12 shrink-0 items-center justify-center rounded-md bg-card text-muted-foreground hover:text-foreground"
          >
            <LinkIcon className="size-4" />
          </a>
        </TooltipTrigger>
        <TooltipContent>{url}</TooltipContent>
      </Tooltip>
    );
  }

  // Arbitrary external/uploaded hosts — next/image can't optimize these.
  return (
    <img
      src={url}
      alt=""
      className="size-12 shrink-0 rounded-md object-cover"
      onError={() => setFailed(true)}
    />
  );
}
