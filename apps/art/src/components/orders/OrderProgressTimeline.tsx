'use client';

import { useTranslation } from '@hatohui/i18n';
import { RichTextView } from '@hatohui/ui';
import { useCommissionProgressByAccessCode } from '@/hooks/useCommissionProgress';
import { useCommissionFormatters } from '@/hooks/useCommissionFormatters';

export function OrderProgressTimeline({ code }: { code: string }) {
  const { t } = useTranslation('art');
  const format = useCommissionFormatters();
  const { items, isLoading } = useCommissionProgressByAccessCode(code);

  if (isLoading) return null;
  if (items.length === 0)
    return (
      <p className="text-sm text-muted-foreground">{t('orders.noUpdates')}</p>
    );

  return (
    <ol className="space-y-6 border-l border-border pl-5">
      {items.map((item) => (
        <li key={item.id} className="relative space-y-2">
          <span
            className="absolute top-1.5 -left-[25px] size-2.5 rounded-full bg-primary"
            aria-hidden
          />
          <p className="text-xs text-muted-foreground">
            {format.date(item.createdAt)}
          </p>
          {item.title && <p className="font-medium">{item.title}</p>}
          {item.body && <RichTextView value={item.body} className="text-sm" />}
          {item.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {item.images.map((url) => (
                <a key={url} href={url} target="_blank" rel="noreferrer">
                  <img
                    src={url}
                    alt=""
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                </a>
              ))}
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}
