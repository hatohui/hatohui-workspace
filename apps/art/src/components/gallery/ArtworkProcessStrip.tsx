'use client';

import { ArrowRight } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import type { AssetDto } from '@hatohui/models';
import { ImageViewer } from '@/components/shared/ImageViewer';
import { useArtworkProcess } from '@/hooks/useArtworkProcess';
import { ArtworkProcessFrame } from './ArtworkProcessFrame';

export function ArtworkProcessStrip({ asset }: { asset: AssetDto }) {
  const { t } = useTranslation('art');
  const process = useArtworkProcess(asset);

  if (!process.hasProcess) return null;

  return (
    <section className="space-y-3">
      <h2 className="font-serif text-2xl">{t('gallery.process.title')}</h2>
      <ol className="flex items-center gap-2 overflow-x-auto pb-2">
        {process.frames.map((frame, index) => (
          <li key={frame.key} className="flex shrink-0 items-center gap-2">
            {index > 0 && (
              <ArrowRight
                className="size-4 text-muted-foreground"
                aria-hidden
              />
            )}
            <ArtworkProcessFrame
              src={frame.src}
              label={frame.label}
              isFinal={frame.isFinal}
              onOpen={() => process.open(index)}
            />
          </li>
        ))}
      </ol>
      <ImageViewer
        src={process.viewer.src}
        alt={process.viewer.caption.title ?? ''}
        caption={process.viewer.caption}
        originalUrl={process.viewer.originalUrl}
        onPrevious={process.viewer.previous ?? undefined}
        onNext={process.viewer.next ?? undefined}
        onClose={process.viewer.close}
      />
    </section>
  );
}
