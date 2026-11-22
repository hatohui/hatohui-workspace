import { NavLink } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import {
  Briefcase,
  CalendarDays,
  Palmtree,
  UtensilsCrossed,
} from 'lucide-react';
import routes from '../../constants/routes';

const ITEMS = [
  {
    to: routes.settingsLeave,
    labelKey: 'settings.tabs.leave',
    icon: Briefcase,
  },
  {
    to: routes.settingsSchedule,
    labelKey: 'settings.tabs.schedule',
    icon: CalendarDays,
  },
  {
    to: routes.settingsHolidays,
    labelKey: 'settings.tabs.holidays',
    icon: Palmtree,
  },
  {
    to: routes.settingsFood,
    labelKey: 'settings.tabs.food',
    icon: UtensilsCrossed,
  },
] as const;

function SettingsNav() {
  const { t } = useTranslation();
  return (
    <nav className="flex flex-wrap gap-1 border-b border-border pb-3">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              ].join(' ')
            }
          >
            <Icon className="size-4" aria-hidden />
            {t(item.labelKey)}
          </NavLink>
        );
      })}
    </nav>
  );
}

export default SettingsNav;
