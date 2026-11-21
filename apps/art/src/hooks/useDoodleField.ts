'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  DOODLE_INVIEW_MARGIN,
  type Doodle,
  type DoodleField,
} from '@/constants/decor';

export function useDoodleField({ pattern, startRem, stepRem }: DoodleField) {
  const ref = useRef<HTMLDivElement>(null);
  const [heightRem, setHeightRem] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const measure = () => {
      const rootFontPx = parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      );
      setHeightRem(element.clientHeight / rootFontPx);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const count = Math.max(0, Math.floor((heightRem - startRem) / stepRem));
  const doodles = useMemo<Doodle[]>(
    () =>
      Array.from({ length: count }, (_, index) => ({
        ...pattern[index % pattern.length],
        top: `${startRem + index * stepRem}rem`,
      })),
    [count, pattern, startRem, stepRem],
  );

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute('data-inview', '');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: DOODLE_INVIEW_MARGIN },
    );
    element
      .querySelectorAll('svg:not([data-inview])')
      .forEach((svg) => observer.observe(svg));
    return () => observer.disconnect();
  }, [doodles]);

  return { ref, doodles };
}
