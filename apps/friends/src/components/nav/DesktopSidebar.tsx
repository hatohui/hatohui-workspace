import { useTranslation } from '@hatohui/i18n';
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@hatohui/ui';
import { navIcons } from '../../constants/navIcons';
import { useNavItems } from '../../hooks/useNavItems';
import useSidebarExpanded from '../../hooks/useSidebarExpanded';
import NavItem from './NavItem';
import SidebarAccount from './SidebarAccount';
import SidebarCollapseToggle from './SidebarCollapseToggle';

interface Props {
  onSettingsClick: () => void;
}

function DesktopSidebar({ onSettingsClick }: Props) {
  const { t } = useTranslation();
  const { expanded, toggle } = useSidebarExpanded();
  const navItems = useNavItems();
  const SettingsIcon = navIcons.settings;

  return (
    <TooltipProvider delayDuration={300}>
      <nav
        className={`fixed inset-y-4 left-4 z-40 hidden flex-col justify-between rounded-3xl border border-border bg-card py-3 shadow-[0_1px_3px_rgba(20,20,19,0.08)] transition-[width] duration-200 sm:flex ${expanded ? 'w-44 px-2' : 'w-14 items-center px-1'}`}
      >
        <div
          className={`flex flex-col gap-1 ${expanded ? '' : 'items-center'}`}
        >
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} expanded={expanded} />
          ))}
        </div>

        <div
          className={`flex flex-col gap-1 ${expanded ? '' : 'items-center'}`}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size={expanded ? 'sm' : 'icon'}
                className={`rounded-full ${expanded ? 'w-full justify-start gap-2 rounded-lg px-3' : ''}`}
                aria-label={t('navigation.settings')}
                onClick={onSettingsClick}
              >
                <SettingsIcon className="size-4 shrink-0" />
                {expanded && (
                  <span className="text-sm">{t('navigation.settings')}</span>
                )}
              </Button>
            </TooltipTrigger>
            {!expanded && (
              <TooltipContent side="right">
                <p>{t('navigation.settings')}</p>
              </TooltipContent>
            )}
          </Tooltip>

          <SidebarAccount expanded={expanded} />
        </div>

        <SidebarCollapseToggle expanded={expanded} onToggle={toggle} />
      </nav>
    </TooltipProvider>
  );
}

export default DesktopSidebar;
