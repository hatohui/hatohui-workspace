import { useTranslation } from '@hatohui/i18n';
import { cn } from '@hatohui/ui';
import { Layers } from 'lucide-react';
import { CHIP_BASE, CHIP_IDLE, CHIP_SELECTED } from '../../constants/chips';

interface Props {
  active: boolean;
  onToggle: () => void;
}

function GroupByCategoryToggle({ active, onToggle }: Props) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onToggle}
      className={cn(
        CHIP_BASE,
        'h-9 sm:h-8',
        active ? CHIP_SELECTED : CHIP_IDLE,
      )}
    >
      <Layers className="size-3.5" aria-hidden />
      {t('catalog.groupByCategory')}
    </button>
  );
}

export default GroupByCategoryToggle;
