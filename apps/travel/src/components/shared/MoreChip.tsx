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
      className="inline-flex h-8 cursor-pointer items-center rounded-full border border-dashed border-border px-2.5 text-xs text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:h-7"
    >
      {expanded
        ? t('filters.showLess')
        : t('filters.showMore', { count: hiddenCount })}
    </button>
  );
}

export default MoreChip;
