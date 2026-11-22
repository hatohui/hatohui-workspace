import type { ReactNode } from 'react';
import { cn } from '@hatohui/ui';
import {
  CATEGORY_PILL_BASE,
  CATEGORY_PILL_IDLE,
  CATEGORY_PILL_SELECTED,
} from '../../constants/chips';

interface Props {
  selected: boolean;
  onClick: () => void;
  label?: string;
  children: ReactNode;
}

function CategoryPill({ selected, onClick, label, children }: Props) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={label}
      onClick={onClick}
      className={cn(
        CATEGORY_PILL_BASE,
        selected ? CATEGORY_PILL_SELECTED : CATEGORY_PILL_IDLE,
      )}
    >
      {children}
    </button>
  );
}

export default CategoryPill;
