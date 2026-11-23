import { useTranslation } from '@hatohui/i18n';
import { Spinner, cn } from '@hatohui/ui';

interface Props {
  isMatched: boolean;
  isSearching: boolean;
}

function MatchBadge({ isMatched, isSearching }: Props) {
  const { t } = useTranslation();

  if (isSearching && !isMatched) {
    return (
      <span
        role="status"
        className="flex items-center gap-1.5 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
      >
        <Spinner className="size-3" />
        {t('form.searching')}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-xs',
        isMatched
          ? 'bg-secondary text-muted-foreground'
          : 'bg-primary/15 text-[#8f4429] dark:bg-primary/25 dark:text-[#e9a487]',
      )}
    >
      {t(isMatched ? 'form.existing' : 'form.new')}
    </span>
  );
}

export default MatchBadge;
