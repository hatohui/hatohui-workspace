import type { ImageViewerCaption as Caption } from '@/hooks/useImageViewer';

export function ImageViewerCaption({ caption }: { caption: Caption }) {
  if (!caption.title && !caption.description) return null;

  return (
    <div className="absolute top-4 left-4 max-w-md space-y-1 rounded-lg bg-black/60 px-4 py-3 backdrop-blur">
      {caption.title && <p className="font-medium">{caption.title}</p>}
      {caption.description && (
        <p className="line-clamp-4 text-sm whitespace-pre-line text-white/80">
          {caption.description}
        </p>
      )}
    </div>
  );
}
