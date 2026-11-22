import type { ElementType, ReactNode } from 'react';

export interface ImageViewerCaption {
  title?: string | null;
  description?: string | null;
}

export interface ImageViewerLabels {
  zoomIn: string;
  zoomOut: string;
  reset: string;
  close: string;
  download: string;
  toggleCaption: string;
  openDetails: string;
  previous: string;
  next: string;
}

export const DEFAULT_IMAGE_VIEWER_LABELS: ImageViewerLabels = {
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  reset: 'Reset zoom',
  close: 'Close',
  download: 'Download original',
  toggleCaption: 'Show or hide details',
  openDetails: 'View details',
  previous: 'Previous image',
  next: 'Next image',
};

export type ImageViewerLink = ElementType<{
  href: string;
  className?: string;
  title?: string;
  'aria-label'?: string;
  children?: ReactNode;
}>;

export const ZOOM_MIN_SCALE = 1;
export const ZOOM_MAX_SCALE = 8;
export const ZOOM_WHEEL_STEP = 1.2;
export const ZOOM_BUTTON_STEP = 1.5;
export const ZOOM_DOUBLE_CLICK_SCALE = 2.5;
export const ZOOM_CLICK_TOLERANCE_PX = 4;
