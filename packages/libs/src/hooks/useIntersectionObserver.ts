import { useEffect, useRef } from 'react';

const DEFAULT_ROOT_MARGIN = '200px';

export function useIntersectionObserver(
  onIntersect: () => void,
  enabled: boolean,
  rootMargin = DEFAULT_ROOT_MARGIN,
) {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const onIntersectRef = useRef(onIntersect);
  onIntersectRef.current = onIntersect;

  useEffect(() => {
    const target = targetRef.current;
    if (!enabled || !target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onIntersectRef.current();
      },
      { rootMargin },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [enabled, rootMargin]);

  return targetRef;
}
