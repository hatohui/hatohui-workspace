import { ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react';
import { Button } from '@hatohui/ui';
import type { SortDirection } from '../constants/directoryView';

type Props = {
  direction: SortDirection;
  onToggle: () => void;
};

function DirectorySortDirectionButton({ direction, onToggle }: Props) {
  const Icon = direction === 'asc' ? ArrowUpNarrowWide : ArrowDownWideNarrow;

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="size-9"
      onClick={onToggle}
    >
      <Icon className="size-4" />
    </Button>
  );
}

export default DirectorySortDirectionButton;
