'use client';

import { useTranslation } from '@hatohui/i18n';
import { Button, RichTextView } from '@hatohui/ui';
import type { CommissionDto } from '@hatohui/models';
import { ReferenceThumbnail } from './ReferenceThumbnail';

export function TriageTable({
  items,
  onAccept,
  onDecline,
}: {
  items: CommissionDto[];
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}) {
  const { t } = useTranslation('art');

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="px-3 py-2 text-left font-medium">
              {t('commission.admin.triage.columns.name')}
            </th>
            <th className="px-3 py-2 text-left font-medium">
              {t('commission.admin.triage.columns.contactMethod')}
            </th>
            <th className="px-3 py-2 text-left font-medium">
              {t('commission.admin.triage.columns.deadline')}
            </th>
            <th className="px-3 py-2 text-left font-medium">
              {t('commission.admin.triage.columns.price')}
            </th>
            <th className="px-3 py-2 text-left font-medium">
              {t('commission.admin.triage.columns.idea')}
            </th>
            <th className="px-3 py-2 text-left font-medium">
              {t('commission.admin.triage.columns.reference')}
            </th>
            <th className="px-3 py-2 text-left font-medium">
              {t('commission.admin.triage.columns.actions')}
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t border-border">
              <td className="px-3 py-2">{item.clientName}</td>
              <td className="px-3 py-2 text-muted-foreground">
                {t(
                  `commission.preferredContactMethod.${item.preferredContactMethod}`,
                )}
              </td>
              <td className="px-3 py-2 text-muted-foreground">
                {item.deadline
                  ? new Date(item.deadline).toLocaleDateString()
                  : '—'}
              </td>
              <td className="px-3 py-2">
                {item.quote != null ? `$${(item.quote / 100).toFixed(2)}` : '—'}
              </td>
              <td className="max-w-64 px-3 py-2">
                <RichTextView
                  value={item.idea}
                  className="line-clamp-2 text-muted-foreground"
                />
              </td>
              <td className="px-3 py-2">
                <ReferenceThumbnail url={item.referenceAssets[0]} />
              </td>
              <td className="px-3 py-2">
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => onAccept(item.id)}>
                    {t('commission.admin.triage.accept')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDecline(item.id)}
                  >
                    {t('commission.admin.triage.decline')}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
