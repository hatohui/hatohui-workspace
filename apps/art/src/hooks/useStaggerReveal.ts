'use client';

import { useLayoutEffect, useRef, type DependencyList } from 'react';
import { gsap } from 'gsap';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export function useStaggerReveal<T extends HTMLElement>(
  selector: string,
  deps: DependencyList,
) {
  const containerRef = useRef<T>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = container.querySelectorAll(selector);
    if (items.length === 0) return;

    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;

    const context = gsap.context(() => {
      gsap.from(items, {
        opacity: 0,
        y: 12,
        duration: 0.35,
        ease: 'power1.out',
        stagger: { each: 0.04, from: 'start' },
      });
    }, container);

    return () => context.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps intentionally control re-trigger
  }, deps);

  return containerRef;
}
