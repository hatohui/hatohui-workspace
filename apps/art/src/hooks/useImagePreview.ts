'use client';

import { createContext, useContext } from 'react';

export type OpenImagePreview = (src: string) => void;

export const ImagePreviewContext = createContext<OpenImagePreview | null>(null);

export function useImagePreview(): OpenImagePreview | null {
  return useContext(ImagePreviewContext);
}
