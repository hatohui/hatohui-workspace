'use client';

import { useState } from 'react';
import type { AssetDto } from '@hatohui/models';

export interface ImageViewerCaption {
  title?: string | null;
  description?: string | null;
}

interface ImageViewerEntry {
  src: string;
  caption: ImageViewerCaption;
  originalUrl: string | null;
  detailsUrl: string | null;
}

interface ImageViewerState {
  entries: ImageViewerEntry[];
  index: number;
}

const toEntry = (
  asset: AssetDto,
  detailsUrl: string | null,
): ImageViewerEntry => ({
  src: asset.previewUrl ?? asset.publicUrl,
  caption: { title: asset.title, description: asset.description },
  originalUrl: asset.publicUrl,
  detailsUrl,
});

export function useImageViewer() {
  const [state, setState] = useState<ImageViewerState | null>(null);
  const current = state ? state.entries[state.index] : null;

  const step = (offset: number) =>
    setState((value) => {
      if (!value) return value;
      const index = value.index + offset;
      return index < 0 || index >= value.entries.length
        ? value
        : { ...value, index };
    });

  return {
    src: current?.src ?? null,
    caption: current?.caption ?? {},
    originalUrl: current?.originalUrl ?? null,
    detailsUrl: current?.detailsUrl ?? null,
    previous: state && state.index > 0 ? () => step(-1) : null,
    next:
      state && state.index < state.entries.length - 1 ? () => step(1) : null,
    open: (
      src: string,
      caption: ImageViewerCaption = {},
      originalUrl: string | null = null,
      detailsUrl: string | null = null,
    ) =>
      setState({
        entries: [{ src, caption, originalUrl, detailsUrl }],
        index: 0,
      }),
    openAssets: (
      assets: AssetDto[],
      index: number,
      detailsUrlFor?: (asset: AssetDto) => string,
    ) =>
      setState({
        entries: assets.map((asset) =>
          toEntry(asset, detailsUrlFor ? detailsUrlFor(asset) : null),
        ),
        index,
      }),
    close: () => setState(null),
  };
}
