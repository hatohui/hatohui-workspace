import { useState } from 'react';

export function usePhotoCarousel(count: number) {
  const [index, setIndex] = useState(0);
  const current = count ? Math.min(index, count - 1) : 0;
  return {
    index: current,
    hasMany: count > 1,
    next: () => setIndex((current + 1) % count),
    previous: () => setIndex((current - 1 + count) % count),
  };
}
