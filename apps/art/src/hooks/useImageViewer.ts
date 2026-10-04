'use client';

import { useState } from 'react';

export interface ImageViewerCaption {
  title?: string | null;
  description?: string | null;
}

export function useImageViewer() {
  const [state, setState] = useState<{
    src: string;
    caption: ImageViewerCaption;
    originalUrl: string | null;
  } | null>(null);

  return {
    src: state?.src ?? null,
    caption: state?.caption ?? {},
    originalUrl: state?.originalUrl ?? null,
    open: (
      src: string,
      caption: ImageViewerCaption = {},
      originalUrl: string | null = null,
    ) => setState({ src, caption, originalUrl }),
    close: () => setState(null),
  };
}
