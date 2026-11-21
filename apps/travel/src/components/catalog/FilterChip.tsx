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
        'inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-full border px-4 text-sm transition-colors duration-150 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none sm:h-10',
        pressed
          ? 'border-primary bg-primary/10 text-foreground'
          : 'border-border text-muted-foreground hover:text-foreground',
      )}
    >
      <Icon className="size-4" aria-hidden />
      {label}
    </button>
  );
}

export default FilterChip;
