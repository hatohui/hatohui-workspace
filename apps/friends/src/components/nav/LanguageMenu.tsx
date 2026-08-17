import { useTranslation } from '@hatohui/i18n';
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@hatohui/ui';
import { navIcons } from '../../constants/navIcons';
import LanguageOptionsList from '../settings/LanguageOptionsList';

interface Props {
  expanded: boolean;
}

function LanguageMenu({ expanded }: Props) {
  const { t } = useTranslation();
  const LanguageIcon = navIcons.language;

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size={expanded ? 'sm' : 'icon'}
              className={`rounded-full ${expanded ? 'w-full justify-start gap-2 rounded-lg px-3' : ''}`}
              aria-label={t('settings.language')}
            >
              <LanguageIcon className="size-4 shrink-0" />
              {expanded && (
                <span className="text-sm">{t('settings.language')}</span>
              )}
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        {!expanded && (
          <TooltipContent side="right">
            <p>{t('settings.language')}</p>
          </TooltipContent>
        )}
      </Tooltip>
      <PopoverContent side="right" align="end" className="w-40 p-1.5">
        <LanguageOptionsList />
      </PopoverContent>
    </Popover>
  );
}

export default LanguageMenu;
