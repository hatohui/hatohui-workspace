import { useEffect, useState, type RefObject } from 'react';
import {
  ADMIN_AUTO_MIN_ROWS,
  ADMIN_FALLBACK_PAGE_SIZE,
  ADMIN_HEADER_HEIGHT_FALLBACK,
  ADMIN_ROW_HEIGHT_FALLBACK,
  ADMIN_TABLE_BOTTOM_SPACE,
} from '../constants/admin';

const visibleHeight = (el: Element | null, fallback: number) =>
  el?.getBoundingClientRect().height || fallback;

export function useAutoFitRows(
  ref: RefObject<HTMLElement | null>,
  remeasureKey: unknown,
) {
  const [rows, setRows] = useState(ADMIN_FALLBACK_PAGE_SIZE);

  useEffect(() => {
    const measure = () => {
      const el = ref.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const header = visibleHeight(
        el.querySelector('thead'),
        ADMIN_HEADER_HEIGHT_FALLBACK,
      );
      const row = visibleHeight(
        el.querySelector('tbody tr'),
        ADMIN_ROW_HEIGHT_FALLBACK,
      );
      const available =
        window.innerHeight - top - header - ADMIN_TABLE_BOTTOM_SPACE;
      setRows(Math.max(ADMIN_AUTO_MIN_ROWS, Math.floor(available / row)));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [ref, remeasureKey]);

  return rows;
}
