'use client';

import Image from 'next/image';
import { Dialog, DialogContent, DialogTitle } from '@hatohui/ui';

export function ImageViewer({
  src,
  alt,
  onClose,
}: {
  src: string | null;
  alt: string;
  onClose: () => void;
}) {
  return (
    <Dialog open={src !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        {src && (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-card">
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-contain"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
