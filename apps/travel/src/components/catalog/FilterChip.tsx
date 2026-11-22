import type { LucideIcon } from 'lucide-react';
import { cn } from '@hatohui/ui';
import { CHIP_BASE, CHIP_IDLE, CHIP_SELECTED } from '../../constants/chips';

interface Props {
  icon: LucideIcon;
  label: string;
  pressed: boolean;
  onChange: (pressed: boolean) => void;
}

function FilterChip({ icon: Icon, label, pressed, onChange }: Props) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => onChange(!pressed)}
      title={label}
      className={cn(CHIP_BASE, pressed ? CHIP_SELECTED : CHIP_IDLE)}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      <span className="truncate">{label}</span>
    </button>
  );
}

export default FilterChip;
