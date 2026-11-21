import { cn } from '@hatohui/ui';

interface Props {
  label: string;
  selected: boolean;
  onClick: () => void;
}

function PresetChip({ label, selected, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'cursor-pointer rounded-full border px-3 py-1 text-xs tabular-nums transition-colors duration-150 motion-reduce:transition-none',
        selected
          ? 'border-primary bg-primary/10'
          : 'border-border text-muted-foreground hover:text-foreground',
      )}
    >
      {label}
    </button>
  );
}

export default PresetChip;
