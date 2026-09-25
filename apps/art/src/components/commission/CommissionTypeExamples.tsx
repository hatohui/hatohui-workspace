'use client';

import Image from 'next/image';
import { ImagePlus } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Spinner } from '@hatohui/ui';
import { useTypeExamples } from '@/hooks/useTypeExamples';

export function CommissionTypeExamples({
  tagName,
}: {
  tagName: string | null;
}) {
  const { t } = useTranslation('art');
  const examples = useTypeExamples(tagName);

  if (!examples.canAdd) return null;

  return (
    <section className="space-y-2">
      <div>
        <h4 className="text-sm font-medium">
          {t('app.commissionSettings.examples.title')}
        </h4>
        <p className="text-xs text-muted-foreground">
          {t('app.commissionSettings.examples.hint')}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {examples.items.map((item) => (
          <div
            key={item.id}
            className="relative size-16 overflow-hidden rounded-md border border-border"
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
        ))}
        <label className="flex size-16 cursor-pointer items-center justify-center rounded-md border border-dashed border-border text-muted-foreground transition-colors hover:bg-muted has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50">
          {examples.isUploading ? (
            <Spinner className="size-4" />
          ) : (
            <ImagePlus className="size-5" aria-hidden />
          )}
          <span className="sr-only">
            {t('app.commissionSettings.examples.add')}
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            disabled={examples.isUploading}
            onChange={(event) => {
              examples.addExamples(Array.from(event.target.files ?? []));
              event.target.value = '';
            }}
          />
        </label>
      </div>
    </section>
  );
}
