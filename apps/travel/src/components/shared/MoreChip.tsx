import { useTranslation } from '@hatohui/i18n';

interface Props {
  expanded: boolean;
  hiddenCount: number;
  onToggle: () => void;
}

function MoreChip({ expanded, hiddenCount, onToggle }: Props) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      aria-expanded={expanded}
      onClick={onToggle}
      className="inline-flex h-8 cursor-pointer items-center rounded-full border border-dashed border-foreground/45 px-2.5 text-xs text-foreground/80 transition-colors outline-none hover:border-foreground/70 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:h-7 dark:border-foreground/35"
    >
      {expanded
        ? t('filters.showLess')
        : t('filters.showMore', { count: hiddenCount })}
    </button>
  );
}

export default MoreChip;
