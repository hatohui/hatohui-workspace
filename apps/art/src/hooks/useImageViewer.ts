'use client';

import { useState } from 'react';

export function useImageViewer() {
  const [src, setSrc] = useState<string | null>(null);
  return { src, open: setSrc, close: () => setSrc(null) };
}
