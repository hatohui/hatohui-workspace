import { cn } from '@hatohui/ui';
import { CHIP_IDLE, CHIP_SELECTED } from '../../constants/chips';

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
        'cursor-pointer rounded-full border px-3 py-1 text-xs tabular-nums transition-colors duration-150 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none',
        selected ? CHIP_SELECTED : CHIP_IDLE,
      )}
    >
      {label}
    </button>
  );
}

export default PresetChip;
