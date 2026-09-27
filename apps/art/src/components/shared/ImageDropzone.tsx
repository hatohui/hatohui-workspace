'use client';

import { useId, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { cn } from '@hatohui/ui';

const ACCEPTED_TYPES = 'image/png,image/jpeg,image/webp,image/gif,image/avif';

export function ImageDropzone({
  onFilesSelected,
  disabled,
  hint,
  compact = false,
}: {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  hint: string;
  compact?: boolean;
}) {
  const inputId = useId();
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <label
      htmlFor={inputId}
      className={cn(
        'flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 text-center text-sm text-muted-foreground transition-[padding,min-height,background-color,border-color]',
        compact ? 'min-h-0 py-2' : 'min-h-24 py-6',
        isDragOver && 'border-primary bg-secondary',
        disabled && 'pointer-events-none opacity-50',
      )}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragOver(false);
        onFilesSelected(Array.from(event.dataTransfer.files));
      }}
    >
      <UploadCloud
        className={cn('shrink-0', compact ? 'size-4' : 'size-5')}
        aria-hidden
      />
      <span>{hint}</span>
      <input
        id={inputId}
        type="file"
        accept={ACCEPTED_TYPES}
        multiple
        disabled={disabled}
        className="hidden"
        onChange={(event) => {
          onFilesSelected(Array.from(event.target.files ?? []));
          event.target.value = '';
        }}
      />
    </label>
  );
}
