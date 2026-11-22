import type { LucideIcon } from 'lucide-react';
import { cn } from '@hatohui/ui';

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
      className={cn(
        'inline-flex h-8 cursor-pointer items-center gap-1 rounded-full border px-2.5 text-xs transition-colors duration-150 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none sm:h-7',
        pressed
          ? 'border-primary bg-primary/10 text-foreground'
          : 'border-border text-muted-foreground hover:text-foreground',
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {label}
    </button>
  );
}

export default FilterChip;
