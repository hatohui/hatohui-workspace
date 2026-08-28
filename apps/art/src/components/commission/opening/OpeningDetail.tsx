'use client';

import { useTranslation } from '@hatohui/i18n';
import { ArrowLeft } from 'lucide-react';
import { Button, RichTextView } from '@hatohui/ui';
import type { JSONContent } from '@tiptap/react';
import type { CommissionOpeningDto } from '@hatohui/models';
import { OpeningStatusBadge } from './OpeningStatusBadge';

function formatDateTime(value: string | null): string | null {
  return value ? new Date(value).toLocaleString() : null;
}

export function OpeningDetail({
  opening,
  onBack,
}: {
  opening: CommissionOpeningDto;
  onBack: () => void;
}) {
  const { t } = useTranslation('art');
  const none = t('commission.admin.opening.detail.none');

  const rows: [string, string][] = [
    [
      t('commission.admin.opening.detail.endMode'),
      t(`commission.admin.opening.endModeShort.${opening.endMode}`),
    ],
    [
      t('commission.admin.opening.detail.slotsTaken'),
      opening.slotCap != null
        ? `${opening.slotsTaken} / ${opening.slotCap}`
        : String(opening.slotsTaken),
    ],
    [
      t('commission.admin.opening.detail.scheduledAt'),
      formatDateTime(opening.scheduledAt) ?? none,
    ],
    [
      t('commission.admin.opening.detail.openedAt'),
      formatDateTime(opening.openedAt) ??
        t('commission.admin.opening.detail.notOpened'),
    ],
    [
      t('commission.admin.opening.detail.closedAt'),
      formatDateTime(opening.closedAt) ??
        t('commission.admin.opening.detail.stillOpen'),
    ],
  ];

  const postBody: JSONContent | null = opening.postBody;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2" onClick={onBack}>
        <ArrowLeft className="size-4" aria-hidden />
        {t('commission.admin.opening.back')}
      </Button>

      <div className="space-y-4 rounded-lg border border-border p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-serif text-xl">
            {t('commission.admin.opening.detail.heading')}
          </h2>
          <OpeningStatusBadge status={opening.status} />
        </div>

        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="space-y-0.5">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="space-y-1.5 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            {t('commission.admin.opening.detail.announcement')}
          </p>
          {opening.postTitle ? (
            <p className="font-medium">{opening.postTitle}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t('commission.admin.opening.detail.noAnnouncement')}
            </p>
          )}
          {postBody && (
            <RichTextView value={postBody} className="text-muted-foreground" />
          )}
        </div>
      </div>
    </div>
  );
}
