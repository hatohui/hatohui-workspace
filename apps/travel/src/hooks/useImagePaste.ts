import { useEffect, useRef } from 'react';

function imageFilesFromClipboard(data: DataTransfer | null): File[] {
  if (!data) return [];
  const fromItems = Array.from(data.items ?? [])
    .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
    .map((item) => item.getAsFile())
    .filter((file): file is File => file !== null);
  if (fromItems.length > 0) return fromItems;
  return Array.from(data.files ?? []).filter((file) =>
    file.type.startsWith('image/'),
  );
}

export function useImagePaste(
  onFiles: (files: File[]) => void,
  enabled = true,
) {
  const callbackRef = useRef(onFiles);
  callbackRef.current = onFiles;

  useEffect(() => {
    if (!enabled) return;
    const handlePaste = (event: ClipboardEvent) => {
      const files = imageFilesFromClipboard(event.clipboardData);
      if (files.length === 0) return;
      event.preventDefault();
      callbackRef.current(files);
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [enabled]);
}
