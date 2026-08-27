'use client';

import { useTranslation } from '@hatohui/i18n';
import { RichTextView } from '@hatohui/ui';
import { useCommissionProgressByAccessCode } from '@/hooks/useCommissionProgress';

export function OrderProgressTimeline({ code }: { code: string }) {
  const { t } = useTranslation('art');
  const { items, isLoading } = useCommissionProgressByAccessCode(code);

  if (isLoading || items.length === 0) return null;

  return (
    <div>
      <h2 className="font-medium">{t('commission.admin.progress.title')}</h2>
      <ul className="mt-2 space-y-3">
        {items.map((item) => (
          <li key={item.id} className="rounded-md bg-card p-3">
            {item.title && <p className="text-sm font-medium">{item.title}</p>}
            {item.body && (
              <RichTextView value={item.body} className="text-sm" />
            )}
            {item.images.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {item.images.map((url) => (
                  <a key={url} href={url} target="_blank" rel="noreferrer">
                    <img
                      src={url}
                      alt=""
                      className="aspect-square w-full rounded object-cover"
                    />
                  </a>
                ))}
              </div>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
