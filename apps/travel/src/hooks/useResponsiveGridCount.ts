import { useEffect, useState } from 'react';

export type ResponsiveGridVariant = 'catalog' | 'adminCards';

function gridCountFor(variant: ResponsiveGridVariant): number {
  if (typeof window === 'undefined') return variant === 'adminCards' ? 24 : 16;
  if (variant === 'adminCards') {
    if (window.matchMedia('(min-width: 1280px)').matches) return 24;
    if (window.matchMedia('(min-width: 1024px)').matches) return 16;
    return 12;
  }
  return window.matchMedia('(min-width: 1280px)').matches ? 16 : 12;
}

export function useResponsiveGridCount(
  variant: ResponsiveGridVariant = 'catalog',
): number {
  const [count, setCount] = useState(() => gridCountFor(variant));

  useEffect(() => {
    const queries =
      variant === 'adminCards'
        ? [
            window.matchMedia('(min-width: 1280px)'),
            window.matchMedia('(min-width: 1024px)'),
          ]
        : [window.matchMedia('(min-width: 1280px)')];
    const update = () => setCount(gridCountFor(variant));
    update();
    for (const mql of queries) mql.addEventListener('change', update);
    return () => {
      for (const mql of queries) mql.removeEventListener('change', update);
    };
  }, [variant]);

  return count;
}
