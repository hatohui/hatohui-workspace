import { useTranslation } from '@hatohui/i18n';
import { cn } from '@hatohui/ui';
import { Layers } from 'lucide-react';

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
        'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-sm transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
        active
          ? 'border-primary/40 bg-primary/10 font-medium text-primary dark:bg-primary/15'
          : 'border-border bg-card text-muted-foreground hover:text-foreground',
      )}
    >
      <Layers className="size-4" aria-hidden />
      {t('catalog.groupByCategory')}
    </button>
  );
}

export default GroupByCategoryToggle;
