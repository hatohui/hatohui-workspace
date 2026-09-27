'use client';

import { useEffect, useState } from 'react';

export function useObjectUrl(file: File): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const created = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the object URL is created and revoked together in this effect
    setUrl(created);
    return () => URL.revokeObjectURL(created);
  }, [file]);

  return url;
}
