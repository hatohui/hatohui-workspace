'use client';

import { useLayoutEffect, useRef, type DependencyList } from 'react';
import { gsap } from 'gsap';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export function useStaggerReveal<T extends HTMLElement>(
  selector: string,
  deps: DependencyList,
) {
  const containerRef = useRef<T>(null);
  const contextRef = useRef<gsap.Context | null>(null);
  const revealedRef = useRef(new WeakSet<Element>());

  useLayoutEffect(() => {
    const context = gsap.context(() => {}, containerRef.current ?? undefined);
    contextRef.current = context;
    return () => {
      context.revert();
      contextRef.current = null;
      revealedRef.current = new WeakSet();
    };
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const context = contextRef.current;
    if (!container || !context) return;

    const revealed = revealedRef.current;
    const items = Array.from(container.querySelectorAll(selector)).filter(
      (item) => !revealed.has(item),
    );
    items.forEach((item) => revealed.add(item));
    if (items.length === 0) return;

    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;

    context.add(() => {
      gsap.from(items, {
        opacity: 0,
        y: 12,
        duration: 0.35,
        ease: 'power1.out',
        stagger: { each: 0.04, from: 'start' },
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps intentionally control re-trigger
  }, deps);

  return containerRef;
}
