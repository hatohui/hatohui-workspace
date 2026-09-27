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
  } | null>(null);

  return {
    src: state?.src ?? null,
    caption: state?.caption ?? {},
    open: (src: string, caption: ImageViewerCaption = {}) =>
      setState({ src, caption }),
    close: () => setState(null),
  };
}
