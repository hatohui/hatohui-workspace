'use client';

import { useTranslation } from '@hatohui/i18n';
import { ReferenceThumbnail } from '@/components/commission/ReferenceThumbnail';

export function CommissionRequestReferences({ urls }: { urls: string[] }) {
  const { t } = useTranslation('art');

  if (urls.length === 0) return null;

  return (
    <section className="space-y-2">
      <h3 className="text-sm font-medium">
        {t('app.requests.panel.references')}
      </h3>
      <div className="flex flex-wrap gap-2">
        {urls.map((url) => (
          <a key={url} href={url} target="_blank" rel="noreferrer">
            <ReferenceThumbnail url={url} />
          </a>
        ))}
      </div>
    </section>
  );
}
