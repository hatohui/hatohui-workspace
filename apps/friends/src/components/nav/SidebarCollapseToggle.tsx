import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@hatohui/ui';

interface Props {
  expanded: boolean;
  onToggle: () => void;
}

function SidebarCollapseToggle({ expanded, onToggle }: Props) {
  const { t } = useTranslation();
  const label = expanded
    ? t('navigation.collapseNav')
    : t('navigation.expandNav');

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="absolute -right-3 top-8 size-6 rounded-full border-border bg-card text-muted-foreground shadow-[0_1px_3px_rgba(20,20,19,0.08)]"
          aria-label={label}
          onClick={onToggle}
        >
          {expanded ? (
            <ChevronLeft className="size-3.5 shrink-0" />
          ) : (
            <ChevronRight className="size-3.5 shrink-0" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default SidebarCollapseToggle;
