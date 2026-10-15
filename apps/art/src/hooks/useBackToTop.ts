'use client';

import { useEffect, useState } from 'react';
import { BACK_TO_TOP_THRESHOLD_PX } from '@/constants/scroll';
import { REDUCED_MOTION_QUERY } from '@/constants/landing';

export function useBackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onScroll = () =>
      setIsVisible(window.scrollY > BACK_TO_TOP_THRESHOLD_PX);

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () =>
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia(REDUCED_MOTION_QUERY).matches
        ? 'auto'
        : 'smooth',
    });

  return { isVisible, scrollToTop };
}
