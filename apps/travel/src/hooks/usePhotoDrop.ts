import { useState, type DragEvent } from 'react';

const isImage = (file: File) => file.type.startsWith('image/');

export function usePhotoDrop(onFiles: (files: File[]) => void) {
  const [isDragging, setIsDragging] = useState(false);

  const stop = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return {
    isDragging,
    handlers: {
      onDragEnter: (event: DragEvent) => {
        stop(event);
        setIsDragging(true);
      },
      onDragOver: stop,
      onDragLeave: (event: DragEvent) => {
        stop(event);
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setIsDragging(false);
        }
      },
      onDrop: (event: DragEvent) => {
        stop(event);
        setIsDragging(false);
        onFiles(Array.from(event.dataTransfer.files).filter(isImage));
      },
    },
  };
}
